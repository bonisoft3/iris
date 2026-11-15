SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- On-demand Gemini Flash translation for camera/uploaded UGC specimens and pure-idiom
-- synchronous translations for static /pictures/ fixtures (forward migration so 015/016
-- digests stay immutable on the live Durable Object ledger).

CREATE OR REPLACE FUNCTION translate_trash_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item_user_id uuid;
  v_picture text;
  v_source_lang text;
  v_label text;
  v_orig_caption text;
  v_orig_instructions text;
  v_orig_material text;
  v_orig_subs text;
  v_orig_price text;
  v_orig_places text;
  v_caption text;
  v_instructions text;
  v_material text;
  v_subs text;
  v_price text;
  v_places text;
  v_payload text;
BEGIN
  SELECT t.user_id,
         t.picture,
         coalesce(nullif(t.user_language, ''), 'en'),
         t.label,
         t.caption,
         t.disposal_instructions,
         t.object_material,
         t.sub_classifications,
         t.price,
         t.nearby_recycling_places
    INTO v_item_user_id,
         v_picture,
         v_source_lang,
         v_label,
         v_orig_caption,
         v_orig_instructions,
         v_orig_material,
         v_orig_subs,
         v_orig_price,
         v_orig_places
    FROM trash_item t
   WHERE t.id = NEW.item_id;

  IF v_label IS NULL THEN
    RETURN NEW;
  END IF;

  -- Real camera/uploaded UGC specimens translate asynchronously via Gemini Flash
  -- through ClassifyJobMachine so every specimen-specific field renders in one pure idiom.
  IF NEW.language <> v_source_lang AND coalesce(v_picture, '') NOT LIKE '/pictures/%' THEN
    v_payload := left(
      '[TRANSLATE:' || NEW.item_id::text || ':' || NEW.language || '] ' ||
      json_build_object(
        'caption', coalesce(v_orig_caption, ''),
        'object_material', coalesce(v_orig_material, ''),
        'disposal_instructions', coalesce(v_orig_instructions, ''),
        'sub_classifications', coalesce(v_orig_subs, ''),
        'price', coalesce(v_orig_price, ''),
        'nearby_recycling_places', coalesce(v_orig_places, '')
      )::text,
      65536
    );

    INSERT INTO classify_job (
      id,
      user_id,
      image_url,
      model,
      user_language,
      user_city,
      status,
      result_json
    ) VALUES (
      NEW.id,
      coalesce(NEW.user_id, v_item_user_id),
      v_payload,
      'gemini',
      NEW.language,
      left(v_source_lang, 80),
      'classifying',
      ''
    ) ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
  END IF;

  IF NEW.language = v_source_lang THEN
    v_caption := left(v_orig_caption, 160);
    v_instructions := coalesce(nullif(v_orig_instructions, ''), '1. Keep clean and dry. 2. Sort into the designated municipal recovery stream.');
    v_material := v_orig_material;
    v_subs := v_orig_subs;
    v_price := v_orig_price;
    v_places := v_orig_places;
  ELSIF NEW.language = 'es' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Envase reciclable verificado';
      v_instructions := '1. Vacíe y enjuague brevemente cualquier residuo líquido o de alimentos. 2. Compacte el envase para optimizar el volumen. 3. Deposítelo en el contenedor de secos de su cooperativa o ecopunto.';
      v_material := 'Polímero o aleación metálica recuperable en ciclo cerrado';
      v_subs := 'Proceso: Clasificación mecánica y reprocesamiento · Restricción: Vaciar líquidos y mantener seco';
      v_price := 'US$ 0,85 / kg (flujo reciclable seco)';
      v_places := 'Cooperativa Vila Mariana (1,4 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Residuos vegetales compostables';
      v_instructions := '1. Retire etiquetas adhesivas, plásticos o metales. 2. Mezcle con hojas secas o aserrín en proporción 1:2 para equilibrar carbono y nitrógeno. 3. Entréguelo en la compostera comunitaria o huerta urbana.';
      v_material := 'Biomasa lignocelulósica y pectina vegetal (C:N ~25:1)';
      v_subs := 'Proceso: Compostaje aeróbico o lombricompostera · Ciclo: 60 a 90 días · Restricción: Sin plásticos, vidrios ni aceites';
      v_price := 'Rinde ~0,5 kg de humus / kg';
      v_places := 'Huerta Comunitaria Butantã (0,4 km) · Patio de Compostaje Pinheiros (1,7 km)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Componente electrónico y batería RAEE';
      v_instructions := '1. Aísle los terminales con cinta no conductora. 2. No lo arroje a la basura común por riesgo de cortocircuito. 3. Llévelo a un punto autorizado de recogida electrónica.';
      v_material := 'Conductores de cobre, celdas de litio y carcasa termoplástica';
      v_subs := 'Proceso: Recuperación hidrometalúrgica de metales · Norma: RAEE · Restricción: Riesgo de ignición si se perfora';
      v_price := 'US$ 2,80 / kg metales críticos';
      v_places := 'Ponto Verde Paulista (0,3 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Pieza cerámica mineral vitrificada';
      v_instructions := '1. Envuelva bordes filosos en cartón grueso y rotule el paquete. 2. No lo mezcle con vidrio porque contamina la fundición. 3. Entréguelo en la bahía de áridos inertes de un ecopunto.';
      v_material := 'Gres aluminosilicato vitrificado de alta temperatura';
      v_subs := 'Proceso: Trituración para árido mineral · Norma: Clase II-B Inerte · Restricción: No mezclar con vidrio sodocálcico';
      v_price := 'Recuperación como árido mineral';
      v_places := 'Ecoponto Pinheiros — Bahía de Inertes (1,2 km)';
    ELSE
      v_caption := 'Residuo general no recuperable';
      v_instructions := '1. Selle el residuo en una bolsa resistente. 2. Manténgalo separado de fibras secas y compostaje. 3. Deposítelo en la recolección domiciliaria municipal.';
      v_material := 'Película multicapa o fibra saturada de grasa';
      v_subs := 'Proceso: Disposición en relleno sanitario · Restricción: No mezclar con papel seco ni compost';
      v_price := 'Sin valor de recuperación';
      v_places := 'Recolección Domiciliaria Municipal';
    END IF;
  ELSIF NEW.language = 'pt' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Embalagem reciclável verificada';
      v_instructions := '1. Esvazie e passe uma água rápida para remover resíduos. 2. Compacte a embalagem para economizar volume no transporte. 3. Deposite no coletor de secos da cooperativa ou ecoponto.';
      v_material := 'Polímero ou liga metálica reciclável em ciclo fechado';
      v_subs := 'Processo: Triagem mecânica e extrusão/refundição · Restrição: Esvaziar líquidos e manter seco';
      v_price := 'R$ 4,50 / kg (fluxo reciclável seco)';
      v_places := 'Cooperativa Vila Mariana (1,4 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Resíduos vegetais compostáveis';
      v_instructions := '1. Remova adesivos plásticos, talheres ou vidros. 2. Intercale com folhas secas ou serragem na proporção 1:2 para equilibrar carbono e umidade. 3. Destine à composteira doméstica ou horta comunitária.';
      v_material := 'Biomassa rica em carbono e pectina vegetal (C:N ~25:1)';
      v_subs := 'Processo: Compostagem aeróbica ou minhocário · Ciclo: 60 a 90 dias · Restrição: Sem plásticos, vidros ou óleos';
      v_price := 'Rende ~0,5 kg de húmus / kg';
      v_places := 'Horta Comunitária Butantã (0,4 km) · Pátio de Compostagem Pinheiros (1,7 km)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Componente eletrônico e bateria REEE';
      v_instructions := '1. Proteja os polos metálicos com fita isolante. 2. Não descarte no cesto comum devido ao risco de curto-circuito. 3. Entregue em ponto certificado de logística reversa.';
      v_material := 'Condutores de cobre, células de lítio e polímero ABS';
      v_subs := 'Processo: Recuperação hidrometalúrgica de metais · Norma: ABNT NBR 16156 · Restrição: Risco de ignição se prensado';
      v_price := 'R$ 15,00 / kg em metais críticos';
      v_places := 'Ponto Verde Paulista (0,3 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Peça cerâmica mineral vitrificada';
      v_instructions := '1. Embale cacos ou bordas cortantes em papelão grosso identificado. 2. Não misture com vidros para não contaminar a fornalha. 3. Entregue na baia de inertes do ecoponto.';
      v_material := 'Cerâmica aluminossilicato vitrificada de alta temperatura';
      v_subs := 'Processo: Britagem para agregado de sub-base · Norma: ABNT Classe II-B Inerte · Restrição: Não misturar com vidro';
      v_price := 'Reaproveitamento como agregado mineral';
      v_places := 'Ecoponto Pinheiros — Baia de Inertes (1,2 km)';
    ELSE
      v_caption := 'Rejeito domiciliar não reciclável';
      v_instructions := '1. Acondicione em saco fechado para evitar vazamentos. 2. Mantenha separado de papéis secos e da composteira. 3. Encaminhe à coleta domiciliar municipal.';
      v_material := 'Filme multicamada ou fibra curta engordurada';
      v_subs := 'Processo: Destinação em aterro sanitário controlado · Restrição: Não colocar no cesto de papel nem na composteira';
      v_price := 'Sem valor de revenda de sucata';
      v_places := 'Coleta Domiciliar Municipal';
    END IF;
  ELSIF NEW.language = 'ru' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Перерабатываемая упаковка';
      v_instructions := '1. Вылейте остатки жидкости и сполосните упаковку. 2. Сожмите тару для экономии объёма. 3. Отправьте в контейнер для сухого вторсырья.';
      v_material := 'Вторичный полимер или металл замкнутого цикла';
      v_subs := 'Процесс: Механическая сортировка и переработка · Ограничение: Удалить жидкость и хранить сухим';
      v_price := '0,85 $ / кг (сухое вторсырьё)';
      v_places := 'Кооператив Вила-Мариана (1,4 км) · Экопункт Пиньейрус (1,9 км)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Растительные органические остатки';
      v_instructions := '1. Удалите пластиковые наклейки и упаковку. 2. Пересыпьте сухими листьями или опилками в пропорции 1:2. 3. Направьте в домашний или районный компостер.';
      v_material := 'Растительная биомасса и пектин (C:N ~25:1)';
      v_subs := 'Процесс: Аэробное компостирование или вермикомпостер · Цикл: 60–90 дней · Ограничение: Без пластика, стекла и жирных соусов';
      v_price := 'Выход ~0,5 кг гумуса / кг';
      v_places := 'Общественный сад Бутантан (0,4 км) · Площадка компостирования Пиньейрус (1,7 км)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Электронный модуль и аккумулятор';
      v_instructions := '1. Изолируйте клеммы диэлектрической лентой. 2. Не выбрасывайте в бытовой мусор из-за риска возгорания. 3. Сдайте в сертифицированный пункт приёма.';
      v_material := 'Медные проводники, литиевые элементы и термопластичный корпус';
      v_subs := 'Процесс: Гидрометаллургическое извлечение металлов · Норма: ОЭЭО · Ограничение: Опасность возгорания при повреждении';
      v_price := '2,80 $ / кг критических металлов';
      v_places := 'Зелёный пункт Паулиста (0,3 км) · Экопункт Пиньейрус (1,9 км)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Керамическое глазурованное изделие';
      v_instructions := '1. Оберните острые осколки плотным картоном и подпишите сверток. 2. Не смешивайте со стеклобоем. 3. Сдайте в отсек инертных отходов.';
      v_material := 'Высокотемпературная глазурованная алюмосиликатная керамика';
      v_subs := 'Процесс: Дробление в минеральный щебень · Норма: Класс II-B Инертные · Ограничение: Не смешивать с тарным стеклом';
      v_price := 'Переработка в минеральный наполнитель';
      v_places := 'Экопункт Пиньейрус — Отсек инертных материалов (1,2 км)';
    ELSE
      v_caption := 'Смешанные неперерабатываемые отходы';
      v_instructions := '1. Герметично упакуйте в плотный пакет. 2. Не допускайте попадания в макулатуру и компост. 3. Поместите в контейнер для ТКО.';
      v_material := 'Многослойный композит и загрязнённая целлюлоза';
      v_subs := 'Процесс: Захоронение на санитарном полигоне · Ограничение: Не смешивать с макулатурой и компостом';
      v_price := 'Без вторичной стоимости';
      v_places := 'Муниципальный вывоз ТКО';
    END IF;
  ELSIF NEW.language = 'he' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'אריזה בת-מיחזור מאומתת';
      v_instructions := '1. רוקנו ושטפו קלות שאריות נוזלים או מזון. 2. מעכו את האריזה לחיסכון בנפח. 3. השליכו לפח המיחזור היבש או לתחנת האיסוף.';
      v_material := 'פולימר או סגסוגת מתכת למיחזור במעגל סגור';
      v_subs := 'תהליך: מיון מכני ומיחזור חומרי · מגבלה: לרוקן נוזלים ולשמור יבש';
      v_price := '0.85 $ לק״ג (זרם יבש ממוין)';
      v_places := 'קואופרטיב וילה מריאנה (1.4 ק״מ) · אקופונטו פיניירוס (1.9 ק״מ)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'שאריות צמחיות לקומפוסט';
      v_instructions := '1. הסירו מדבקות פלסטיק או אריזות. 2. שלבו עם עלים יבשים או נסורת ביחס 1:2 לאיזון פחמן-חנקן. 3. העבירו לקומפוסטר הביתי או לגינה הקהילתית.';
      v_material := 'ביומסה צמחית ושאריות עמילניות (יחס פחמן:חנקן ~25:1)';
      v_subs := 'תהליך: קומפוסטציה אירובית או תולעים אדומות · מחזור: 60–90 יום · מגבלה: ללא פלסטיק, זכוכית או שמנים';
      v_price := 'מפיק ~0.5 ק״ג הומוס לק״ג';
      v_places := 'הגינה הקהילתית בוטנטאן (0.4 ק״מ) · מתחם קומפוסט פיניירוס (1.7 ק״מ)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'רכיב אלקטרוני וסוללה למיחזור';
      v_instructions := '1. כסו את מגעי המתכת בסרט בידוד. 2. אל תשליכו לפח הרגיל בשל סכנת התלקחות. 3. מסרו בנקודת איסוף מוסמכת.';
      v_material := 'מוליכי נחושת, תאי ליתיום ומארז תרמופלסטי';
      v_subs := 'תהליך: הפקה הידרו-מטאלורגית של מתכות · תקן: פסולת אלקטרונית · מגבלה: סכנת התלקחות בניקוב';
      v_price := '2.80 $ לק״ג מתכות קריטיות';
      v_places := 'נקודה ירוקה פאוליסטה (0.3 ק״מ) · אקופונטו פיניירוס (1.9 ק״מ)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'פריט קרמי מינרלי מזוגג';
      v_instructions := '1. עטפו שברים חדים בקרטון עבה וסמנו את האריזה. 2. אל תערבבו עם זכוכית. 3. מסרו במפרץ החומרים האינרטיים.';
      v_material := 'קרמיקה אלומינו-סיליקטית מזוגגת בטמפרטורה גבוהה';
      v_subs := 'תהליך: גריסה לאגרגט מינרלי · תקן: סיווג II-B אינרטי · מגבלה: אין לערבב עם זכוכית אריזות';
      v_price := 'השבה כאגרגט מינרלי';
      v_places := 'אקופונטו פיניירוס — מפרץ אינרטיים (1.2 ק״מ)';
    ELSE
      v_caption := 'פסולת ביתית שאינה ניתנת למיחזור';
      v_instructions := '1. אטמו בשקית אשפה חזקה. 2. הפרידו מנייר יבש ומקומפוסט. 3. השליכו לאיסוף העירוני.';
      v_material := 'למינציה רב-שכבתית וסיבי תאית ספוגי שומן';
      v_subs := 'תהליך: הטמנה מבוקרת · מגבלה: להפריד מנייר יבש ומקומפוסט';
      v_price := 'ללא ערך גרט למיחזור';
      v_places := 'איסוף אשפה עירוני';
    END IF;
  ELSIF NEW.language = 'kk' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Тексерілген қайта өңделетін қаптама';
      v_instructions := '1. Сұйықтық қалдықтарын төгіп, жеңіл шайып жіберіңіз. 2. Орын үнемдеу үшін қаптаманы сығымдаңыз. 3. Құрғақ шикізат контейнеріне салыңыз.';
      v_material := 'Тұйық циклде қайта өңделетін полимер немесе қорытпа';
      v_subs := 'Процесс: Механикалық сұрыптау және қайта өңдеу · Шектеу: Сұйықтықты төгіп, құрғақ ұстау';
      v_price := '0,85 $ / кг (құрғақ қайта өңдеу ағыны)';
      v_places := 'Вила-Мариана кооперативі (1,4 км) · Пиньейрус экобекеті (1,9 км)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Компостталатын өсімдік қалдығы';
      v_instructions := '1. Пластик жапсырмаларды алып тастаңыз. 2. Құрғақ жапырақтармен 1:2 қатынасында араластырыңыз. 3. Қоғамдық немесе үй компостеріне жіберіңіз.';
      v_material := 'Лигноцеллюлозалық биомасса және өсімдік пектині (C:N ~25:1)';
      v_subs := 'Процесс: Аэробты компосттау немесе вермикомпост · Цикл: 60–90 күн · Шектеу: Пластик, шыны және май қоспау';
      v_price := 'Шығымы ~0,5 кг гумус / кг';
      v_places := 'Бутантан қоғамдық бағы (0,4 км) · Пиньейрус компост алаңы (1,7 км)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Электрондық компонент және батарея';
      v_instructions := '1. Аккумулятор түйіспелерін оқшаулағыш таспамен жабыңыз. 2. Тұрмыстық қоқысқа тастамаңыз. 3. Арнайы қабылдау бекетіне тапсырыңыз.';
      v_material := 'Мыс өткізгіштер, литий ұяшықтары және термопластик корпус';
      v_subs := 'Процесс: Металдарды гидрометаллургиялық бөліп алу · Норма: ЭҚҚ · Шектеу: Тесілгенде тұтану қаупі бар';
      v_price := '2,80 $ / кг бағалы металдар';
      v_places := 'Паулиста жасыл бекеті (0,3 км) · Пиньейрус экобекеті (1,9 км)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Күйдірілген глазурленген керамика';
      v_instructions := '1. Өткір сынықтарды қалың картонға орап, белгі қойыңыз. 2. Шыны қалдықтарымен араластырмаңыз. 3. Инертті материалдар бөліміне тапсырыңыз.';
      v_material := 'Жоғары температурада күйдірілген глазурленген керамика';
      v_subs := 'Процесс: Минералды қиыршық тасқа ұсақтау · Норма: II-B класты инертті · Шектеу: Ыдыс шынысымен араластырмау';
      v_price := 'Минералды толтырғыш ретінде кәдеге жарату';
      v_places := 'Пиньейрус экобекеті — Инертті материалдар бөлімі (1,2 км)';
    ELSE
      v_caption := 'Қайта өңделмейтін тұрмыстық қалдық';
      v_instructions := '1. Берік пакетке салып, аузын мықтап байлаңыз. 2. Макулатура мен компостқа қоспаңыз. 3. Муниципалды қоқыс контейнеріне тастаңыз.';
      v_material := 'Көпқабатты композит және май сіңген целлюлоза';
      v_subs := 'Процесс: Санитарлық полигонға көму · Шектеу: Құрғақ қағаз бен компостқа қоспау';
      v_price := 'Қайталама шикізат құны жоқ';
      v_places := 'Муниципалды тұрмыстық қалдықтарды шығару';
    END IF;
  ELSE
    IF v_label = 'recyclable' THEN
      v_caption := 'Verified Recyclable Packaging';
      v_instructions := '1. Empty any remaining liquid and briefly rinse residue. 2. Crush or flatten to save collection volume. 3. Place in the dry recyclables stream or drop off at a sorting cooperative.';
      v_material := 'Closed-loop recyclable polymer or metal alloy';
      v_subs := 'Process: Mechanical sorting & reprocessing · Restriction: Empty liquids and keep dry';
      v_price := 'US$ 0.85 / kg (sorted dry stream)';
      v_places := 'Vila Mariana Cooperative (1.4 km) · Pinheiros Ecopoint (1.9 km)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Compostable Plant Scraps';
      v_instructions := '1. Remove any plastic stickers, twist-ties, or packaging. 2. Layer 1:2 with dry leaves or sawdust to balance carbon and moisture. 3. Route to a household worm bin or community compost hub.';
      v_material := 'Lignocellulosic plant biomass & pectin (C:N ~25:1)';
      v_subs := 'Process: Aerobic composting or vermicomposting · Cycle: 60–90 days · Restriction: No plastics, glass, or cooking oils';
      v_price := 'Yields ~0.5 kg humus / kg';
      v_places := 'Butantã Community Garden (0.4 km) · Pinheiros Composting Yard (1.7 km)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Electronic Waste & Battery Pack';
      v_instructions := '1. Insulate exposed battery terminals with non-conductive tape. 2. Never place in household trash or compactors due to fire risk. 3. Deliver to a certified e-waste reverse-logistics drop-off point.';
      v_material := 'Copper conductors, lithium cells & thermoplastic casing';
      v_subs := 'Process: Hydrometallurgical metal recovery · Standard: WEEE · Restriction: Fire risk if punctured or compacted';
      v_price := 'US$ 2.80 / kg critical metals';
      v_places := 'Paulista Green Point (0.3 km) · Pinheiros Ecopoint (1.9 km)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Vitrified Ceramic Item';
      v_instructions := '1. Wrap sharp edges or shards in thick labelled cardboard. 2. Keep out of glass bins to avoid furnace contamination. 3. Deliver to the municipal inert mineral drop-off bay.';
      v_material := 'High-temperature glazed aluminosilicate stoneware';
      v_subs := 'Process: Crushing into mineral aggregate · Standard: Class II-B Inert · Restriction: Never mix with soda-lime container glass';
      v_price := 'Mineral aggregate recovery only';
      v_places := 'Pinheiros Ecopoint — Inert Rubble Bay (1.2 km)';
    ELSE
      v_caption := 'Non-Recyclable Residual Waste';
      v_instructions := '1. Seal inside a leak-proof bag. 2. Keep strictly separate from dry paper and organic compost bins. 3. Place in regular municipal waste collection.';
      v_material := 'Multi-layer film or grease-saturated cellulose';
      v_subs := 'Process: Sanitary landfill disposal · Restriction: Keep out of dry paper and compost streams';
      v_price := 'No scrap recovery value';
      v_places := 'Municipal Household Collection';
    END IF;
  END IF;

  INSERT INTO trash_item_translation (
    id, item_id, language, caption, disposal_instructions, object_material, sub_classifications, price, nearby_recycling_places, created_at
  ) VALUES (
    NEW.id, NEW.item_id, NEW.language, left(v_caption, 160), v_instructions,
    left(coalesce(v_material, ''), 160),
    left(coalesce(v_subs, ''), 500),
    left(coalesce(v_price, ''), 64),
    left(coalesce(v_places, ''), 600),
    NEW.created_at
  )
  ON CONFLICT (item_id, language) DO UPDATE
    SET caption = EXCLUDED.caption,
        disposal_instructions = EXCLUDED.disposal_instructions,
        object_material = EXCLUDED.object_material,
        sub_classifications = EXCLUDED.sub_classifications,
        price = EXCLUDED.price,
        nearby_recycling_places = EXCLUDED.nearby_recycling_places;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION settle_classify_job() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_json jsonb := '{}'::jsonb;
  v_header text;
  v_item_id uuid;
  v_target_lang text;
  v_caption text;
  v_label text;
  v_label_key text;
  v_material text;
  v_instructions text;
  v_subs text;
  v_price text;
  v_places text;
BEGIN
  IF NEW.status NOT IN ('done', 'failed') THEN
    RETURN NULL;
  END IF;

  IF NEW.image_url LIKE '[TRANSLATE:%' THEN
    v_header := split_part(substr(NEW.image_url, 12), ']', 1);
    BEGIN
      v_item_id := split_part(v_header, ':', 1)::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
      DELETE FROM classify_job WHERE id = NEW.id;
      RETURN NULL;
    END;
    v_target_lang := split_part(v_header, ':', 2);

    IF NEW.status = 'failed' OR NOT EXISTS (SELECT 1 FROM trash_item WHERE id = v_item_id) THEN
      DELETE FROM classify_job WHERE id = NEW.id;
      RETURN NULL;
    END IF;

    v_json := NEW.result_json::jsonb;
    v_caption := left(coalesce(btrim(v_json->>'caption'), ''), 160);
    v_instructions := left(coalesce(btrim(v_json->>'disposal_instructions'), ''), 2000);
    IF v_caption = '' OR v_instructions = '' THEN
      RAISE EXCEPTION 'classify_job % settled done with incomplete translation payload', NEW.id USING ERRCODE = 'check_violation';
    END IF;

    v_material := left(coalesce(btrim(v_json->>'object_material'), ''), 160);
    v_subs := left(coalesce(btrim(v_json->>'sub_classifications'), ''), 500);
    v_price := left(coalesce(btrim(v_json->>'price'), ''), 64);
    v_places := left(coalesce(btrim(v_json->>'nearby_recycling_places'), ''), 600);

    INSERT INTO trash_item_translation (
      id,
      item_id,
      language,
      caption,
      disposal_instructions,
      object_material,
      sub_classifications,
      price,
      nearby_recycling_places,
      created_at
    ) VALUES (
      NEW.id,
      v_item_id,
      v_target_lang,
      v_caption,
      v_instructions,
      v_material,
      v_subs,
      v_price,
      v_places,
      now()
    )
    ON CONFLICT (item_id, language) DO UPDATE
      SET caption = EXCLUDED.caption,
          disposal_instructions = EXCLUDED.disposal_instructions,
          object_material = EXCLUDED.object_material,
          sub_classifications = EXCLUDED.sub_classifications,
          price = EXCLUDED.price,
          nearby_recycling_places = EXCLUDED.nearby_recycling_places;

    DELETE FROM classify_job WHERE id = NEW.id;
    RETURN NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM track_request WHERE id = NEW.id) THEN
    DELETE FROM classify_job WHERE id = NEW.id;
    RETURN NULL;
  END IF;

  IF NEW.status = 'failed' THEN
    UPDATE track_request
       SET status = 'failed'
     WHERE id = NEW.id;
    RETURN NULL;
  END IF;

  v_json := NEW.result_json::jsonb;

  v_label := nullif(btrim(v_json->>'label'), '');
  IF v_label IS NULL OR v_label NOT IN ('recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash') THEN
    RAISE EXCEPTION 'classify_job % settled done with invalid label %', NEW.id, coalesce(v_label, '<null>') USING ERRCODE = 'check_violation';
  END IF;
  v_label_key := 'cat_' || v_label;

  v_caption := left(coalesce(btrim(v_json->>'caption'), ''), 160);
  v_material := left(coalesce(btrim(v_json->>'object_material'), ''), 160);
  v_instructions := left(coalesce(btrim(v_json->>'disposal_instructions'), ''), 2000);
  IF v_caption = '' OR v_material = '' OR v_instructions = '' THEN
    RAISE EXCEPTION 'classify_job % settled done with incomplete classification payload', NEW.id USING ERRCODE = 'check_violation';
  END IF;

  v_subs := left(coalesce(btrim(v_json->>'sub_classifications'), ''), 500);
  v_price := left(coalesce(btrim(v_json->>'price'), ''), 64);
  v_places := left(coalesce(btrim(v_json->>'nearby_recycling_places'), ''), 600);

  INSERT INTO trash_item (
    id,
    request_id,
    user_id,
    picture,
    caption,
    label,
    label_key,
    object_material,
    disposal_instructions,
    sub_classifications,
    price,
    is_disposal_place,
    nearby_recycling_places,
    tagged_as_inappropriate,
    user_language,
    latitude,
    longitude,
    created_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.user_id,
    NEW.image_url,
    v_caption,
    v_label,
    v_label_key,
    v_material,
    v_instructions,
    v_subs,
    v_price,
    false,
    v_places,
    false,
    NEW.user_language,
    NEW.latitude,
    NEW.longitude,
    now()
  ) ON CONFLICT (request_id) DO NOTHING;

  UPDATE track_request
     SET status = 'classified'
   WHERE id = NEW.id;

  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION translate_trash_item() FROM PUBLIC, app_user, anon;
REVOKE EXECUTE ON FUNCTION settle_classify_job() FROM PUBLIC, app_user, anon;
