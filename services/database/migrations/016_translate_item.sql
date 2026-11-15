-- Deterministic multilingual translation trigger (ir decision-translation-trigger).
-- Promotes incoming `translation_request` rows into `trash_item_translation`
-- synchronously using `NEW.id` and `NEW.created_at` (zero volatile calls).

SET lock_timeout = '5s';
SET statement_timeout = '60s';

BEGIN;

CREATE OR REPLACE FUNCTION translate_trash_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
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
BEGIN
  SELECT t.picture,
         coalesce(nullif(t.user_language, ''), 'en'),
         t.label,
         t.caption,
         t.disposal_instructions,
         t.object_material,
         t.sub_classifications,
         t.price,
         t.nearby_recycling_places
    INTO v_picture,
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

  v_material := v_orig_material;
  v_subs := v_orig_subs;
  v_price := v_orig_price;
  v_places := v_orig_places;

  IF NEW.language = v_source_lang THEN
    v_caption := left(v_orig_caption, 160);
    v_instructions := coalesce(nullif(v_orig_instructions, ''), '1. Keep clean and dry. 2. Sort into the designated municipal recovery stream.');
  ELSIF NEW.language = 'es' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Envase verificado — ' || left(v_orig_caption, 96);
      v_instructions := '1. Vacíe y enjuague brevemente cualquier residuo líquido o de alimentos. 2. Compacte el envase para optimizar el volumen. 3. Deposítelo en el contenedor de secos de su cooperativa o ecopunto.';
      v_material := coalesce(nullif(v_material, ''), 'Polímero o aleación recuperable');
      v_subs := 'Proceso: Clasificación mecánica y reprocesamiento · Restricción: Vaciar líquidos y mantener seco';
      v_price := coalesce(nullif(v_price, ''), 'US$ 0,85 / kg');
      v_places := 'Cooperativa Vila Mariana (1,4 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Fracción vegetal — ' || left(v_orig_caption, 96);
      v_instructions := '1. Retire etiquetas adhesivas, plásticos o metales. 2. Mezcle con hojas secas o aserrín en proporción 1:2 para equilibrar carbono y nitrógeno. 3. Entréguelo en la compostera comunitaria o huerta urbana.';
      v_material := 'Biomasa lignocelulósica y almidón vegetal (C:N ~25:1)';
      v_subs := 'Proceso: Compostaje aeróbico o lombricompostera · Ciclo: 60 a 90 días · Restricción: Sin plásticos, vidrios ni aceites';
      v_price := 'Rinde ~0,5 kg de humus / kg';
      v_places := 'Huerta Comunitaria Butantã (0,4 km) · Patio de Compostaje Pinheiros (1,7 km)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Componente RAEE — ' || left(v_orig_caption, 96);
      v_instructions := '1. Aísle los terminales con cinta no conductora. 2. No lo arroje a la basura común por riesgo de cortocircuito. 3. Llévelo a un punto autorizado de recogida electrónica.';
      v_material := 'Conductores de cobre, celdas de litio y carcasa termoplástica';
      v_subs := 'Proceso: Recuperación hidrometalúrgica de metales · Norma: RAEE · Restricción: Riesgo de ignición si se perfora';
      v_price := 'US$ 2,80 / kg metales críticos';
      v_places := 'Ponto Verde Paulista (0,3 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Pieza mineral vitrificada — ' || left(v_orig_caption, 96);
      v_instructions := '1. Envuelva bordes filosos en cartón grueso y rotule el paquete. 2. No lo mezcle con vidrio porque contamina la fundición. 3. Entréguelo en la bahía de áridos inertes de un ecopunto.';
      v_material := 'Gres aluminosilicato vitrificado de alta temperatura';
      v_subs := 'Proceso: Trituración para árido mineral · Norma: Clase II-B Inerte · Restricción: No mezclar con vidrio sodocálcico';
      v_price := 'Recuperación como árido mineral';
      v_places := 'Ecoponto Pinheiros — Bahía de Inertes (1,2 km)';
    ELSE
      v_caption := 'Fracción de rechazo — ' || left(v_orig_caption, 96);
      v_instructions := '1. Selle el residuo en una bolsa resistente. 2. Manténgalo separado de fibras secas y compostaje. 3. Deposítelo en la recolección domiciliaria municipal.';
      v_material := 'Película multicapa o fibra saturada de grasa';
      v_subs := 'Proceso: Disposición en relleno sanitario · Restricción: No mezclar con papel seco ni compost';
      v_price := 'Sin valor de recuperación';
      v_places := 'Recolección Domiciliaria Municipal';
    END IF;
  ELSIF NEW.language = 'pt' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Embalagem verificada — ' || left(v_orig_caption, 96);
      v_instructions := '1. Esvazie e passe uma água rápida para remover resíduos. 2. Compacte a embalagem para economizar volume no transporte. 3. Deposite no coletor de secos da cooperativa ou ecoponto.';
      v_material := coalesce(nullif(v_material, ''), 'Polímero ou liga metálica de ciclo fechado');
      v_subs := 'Processo: Triagem mecânica e extrusão/refundição · Restrição: Esvaziar líquidos e manter seco';
      v_price := coalesce(nullif(v_price, ''), 'R$ 4,50 / kg');
      v_places := 'Cooperativa Vila Mariana (1,4 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Fração vegetal — ' || left(v_orig_caption, 96);
      v_instructions := '1. Remova adesivos plásticos, talheres ou vidros. 2. Intercale com folhas secas ou serragem na proporção 1:2 para equilibrar carbono e umidade. 3. Destine à composteira doméstica ou horta comunitária.';
      v_material := 'Biomassa rica em carbono e amido vegetal (C:N ~25:1)';
      v_subs := 'Processo: Compostagem aeróbica ou minhocário · Ciclo: 60 a 90 dias · Restrição: Sem plásticos, vidros ou óleos';
      v_price := 'Rende ~0,5 kg de húmus / kg';
      v_places := 'Horta Comunitária Butantã (0,4 km) · Pátio de Compostagem Pinheiros (1,7 km)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Componente REEE — ' || left(v_orig_caption, 96);
      v_instructions := '1. Proteja os polos metálicos com fita isolante. 2. Não descarte no cesto comum devido ao risco de curto-circuito. 3. Entregue em ponto certificado de logística reversa.';
      v_material := 'Condutores de cobre, células de lítio e polímero ABS';
      v_subs := 'Processo: Recuperação hidrometalúrgica de metais · Norma: ABNT NBR 16156 · Restrição: Risco de ignição se prensado';
      v_price := 'R$ 15,00 / kg em metais críticos';
      v_places := 'Ponto Verde Paulista (0,3 km) · Ecoponto Pinheiros (1,9 km)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Peça mineral vitrificada — ' || left(v_orig_caption, 96);
      v_instructions := '1. Embale cacos ou bordas cortantes em papelão grosso identificado. 2. Não misture com vidros para não contaminar a fornalha. 3. Entregue na baia de inertes do ecoponto.';
      v_material := 'Cerâmica aluminossilicato vitrificada de alta temperatura';
      v_subs := 'Processo: Britagem para agregado de sub-base · Norma: ABNT Classe II-B Inerte · Restrição: Não misturar com vidro';
      v_price := 'Reaproveitamento como agregado mineral';
      v_places := 'Ecoponto Pinheiros — Baia de Inertes (1,2 km)';
    ELSE
      v_caption := 'Fração de rejeito — ' || left(v_orig_caption, 96);
      v_instructions := '1. Acondicione em saco fechado para evitar vazamentos. 2. Mantenha separado de papéis secos e da composteira. 3. Encaminhe à coleta domiciliar municipal.';
      v_material := 'Filme multicamada ou fibra curta engordurada';
      v_subs := 'Processo: Destinação em aterro sanitário controlado · Restrição: Não colocar no cesto de papel nem na composteira';
      v_price := 'Sem valor de revenda de sucata';
      v_places := 'Coleta Domiciliar Municipal';
    END IF;
  ELSIF NEW.language = 'ru' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Проверенная тара — ' || left(v_orig_caption, 96);
      v_instructions := '1. Вылейте остатки жидкости и сполосните упаковку. 2. Сожмите тару для экономии объёма. 3. Отправьте в контейнер для сухого вторсырья.';
      v_material := coalesce(nullif(v_material, ''), 'Вторичный полимер или металл');
      v_subs := 'Процесс: Механическая сортировка и переработка · Ограничение: Удалить жидкость и хранить сухим';
      v_price := coalesce(nullif(v_price, ''), '0,85 $ / кг');
      v_places := 'Кооператив Vila Mariana (1,4 км) · Экопункт Pinheiros (1,9 км)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Растительная фракция — ' || left(v_orig_caption, 96);
      v_instructions := '1. Удалите пластиковые наклейки и упаковку. 2. Пересыпьте сухими листьями или опилками в пропорции 1:2. 3. Направьте в домашний или районный компостер.';
      v_material := 'Растительная биомасса и крахмалистые остатки (C:N ~25:1)';
      v_subs := 'Процесс: Аэробное компостирование или вермикомпостер · Цикл: 60–90 дней · Ограничение: Без пластика, стекла и жирных соусов';
      v_price := 'Выход ~0,5 кг гумуса / кг';
      v_places := 'Общественный сад Butantã (0,4 км) · Площадка компостирования Pinheiros (1,7 км)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Электронный модуль (ОЭЭО) — ' || left(v_orig_caption, 96);
      v_instructions := '1. Изолируйте клеммы диэлектрической лентой. 2. Не выбрасывайте в бытовой мусор из-за риска возгорания. 3. Сдайте в сертифицированный пункт приёма.';
      v_material := 'Медные проводники, литиевые элементы и термопластичный корпус';
      v_subs := 'Процесс: Гидрометаллургическое извлечение металлов · Норма: ОЭЭО · Ограничение: Опасность возгорания при повреждении';
      v_price := '2,80 $ / кг критических металлов';
      v_places := 'Зелёный пункт Paulista (0,3 км) · Экопункт Pinheiros (1,9 км)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Керамическое изделие — ' || left(v_orig_caption, 96);
      v_instructions := '1. Оберните острые осколки плотным картоном и подпишите сверток. 2. Не смешивайте со стеклобоем. 3. Сдайте в отсек инертных отходов.';
      v_material := 'Высокотемпературная глазурованная алюмосиликатная керамика';
      v_subs := 'Процесс: Дробление в минеральный щебень · Норма: Класс II-B Инертные · Ограничение: Не смешивать с тарным стеклом';
      v_price := 'Переработка в минеральный наполнитель';
      v_places := 'Экопункт Pinheiros — Отсек инертных материалов (1,2 км)';
    ELSE
      v_caption := 'Смешанная фракция — ' || left(v_orig_caption, 96);
      v_instructions := '1. Герметично упакуйте в плотный пакет. 2. Не допускайте попадания в макулатуру и компост. 3. Поместите в контейнер для ТКО.';
      v_material := 'Многослойный композит и загрязнённая целлюлоза';
      v_subs := 'Процесс: Захоронение на санитарном полигоне · Ограничение: Не смешивать с макулатурой и компостом';
      v_price := 'Без вторичной стоимости';
      v_places := 'Муниципальный вывоз ТКО';
    END IF;
  ELSIF NEW.language = 'he' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'אריזה מאומתת — ' || left(v_orig_caption, 96);
      v_instructions := '1. רוקנו ושטפו קלות שאריות נוזלים או מזון. 2. מעכו את האריזה לחיסכון בנפח. 3. השליכו לפח המיחזור היבש או לתחנת האיסוף.';
      v_material := coalesce(nullif(v_material, ''), 'פולימר או סגסוגת מתכת למיחזור');
      v_subs := 'תהליך: מיון מכני ומיחזור חומרי · מגבלה: לרוקן נוזלים ולשמור יבש';
      v_price := coalesce(nullif(v_price, ''), '0.85 $ / ק"ג');
      v_places := 'קואופרטיב Vila Mariana (1.4 ק"מ) · אקופונטו Pinheiros (1.9 ק"מ)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'מקטע צמחי — ' || left(v_orig_caption, 96);
      v_instructions := '1. הסירו מדבקות פלסטיק או אריזות. 2. שלבו עם עלים יבשים או נסורת ביחס 1:2 לאיזון פחמן-חנקן. 3. העבירו לקומפוסטר הביתי או לגינה הקהילתית.';
      v_material := 'ביומסה צמחית ושאריות עמילניות (יחס פחמן:חנקן ~25:1)';
      v_subs := 'תהליך: קומפוסטציה אירובית או תולעים אדומות · מחזור: 60–90 יום · מגבלה: ללא פלסטיק, זכוכית או שמנים';
      v_price := 'מפיק ~0.5 ק"ג הומוס / ק"ג';
      v_places := 'הגינה הקהילתית Butantã (0.4 ק"מ) · מתחם קומפוסט Pinheiros (1.7 ק"מ)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'רכיב אלקטרוני וסוללה — ' || left(v_orig_caption, 96);
      v_instructions := '1. כסו את מגעי המתכת בסרט בידוד. 2. אל תשליכו לפח הרגיל בשל סכנת התלקחות. 3. מסרו בנקודת איסוף מוסמכת.';
      v_material := 'מוליכי נחושת, תאי ליתיום ומארז תרמופלסטי';
      v_subs := 'תהליך: הפקה הידרו-מטאלורגית של מתכות · תקן: פסולת אלקטרונית · מגבלה: סכנת התלקחות בניקוב';
      v_price := '2.80 $ / ק"ג מתכות קריטיות';
      v_places := 'נקודה ירוקה Paulista (0.3 ק"מ) · אקופונטו Pinheiros (1.9 ק"מ)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'פריט קרמי מזוגג — ' || left(v_orig_caption, 96);
      v_instructions := '1. עטפו שברים חדים בקרטון עבה וסמנו את האריזה. 2. אל תערבבו עם זכוכית. 3. מסרו במפרץ החומרים האינרטיים.';
      v_material := 'קרמיקה אלומינו-סיליקטית מזוגגת בטמפרטורה גבוהה';
      v_subs := 'תהליך: גריסה לאגרגט מינרלי · תקן: סיווג II-B אינרטי · מגבלה: אין לערבב עם זכוכית אריזות';
      v_price := 'השבה כאגרגט מינרלי';
      v_places := 'אקופונטו Pinheiros — מפרץ אינרטיים (1.2 ק"מ)';
    ELSE
      v_caption := 'מקטע שאריות — ' || left(v_orig_caption, 96);
      v_instructions := '1. אטמו בשקית אשפה חזקה. 2. הפרידו מנייר יבש ומקומפוסט. 3. השליכו לאיסוף העירוני.';
      v_material := 'למינציה רב-שכבתית וסיבי תאית ספוגי שומן';
      v_subs := 'תהליך: הטמנה מבוקרת · מגבלה: להפריד מנייר יבש ומקומפוסט';
      v_price := 'ללא ערך גרט למיחזור';
      v_places := 'איסוף אשפה עירוני';
    END IF;
  ELSIF NEW.language = 'kk' THEN
    IF v_label = 'recyclable' THEN
      v_caption := 'Тексерілген қаптама — ' || left(v_orig_caption, 96);
      v_instructions := '1. Сұйықтық қалдықтарын төгіп, жеңіл шайып жіберіңіз. 2. Орын үнемдеу үшін қаптаманы сығымдаңыз. 3. Құрғақ шикізат контейнеріне салыңыз.';
      v_material := coalesce(nullif(v_material, ''), 'Қайта өңделетін полимер немесе қорытпа');
      v_subs := 'Процесс: Механикалық сұрыптау және қайта өңдеу · Шектеу: Сұйықтықты төгіп, құрғақ ұстау';
      v_price := coalesce(nullif(v_price, ''), '0,85 $ / кг');
      v_places := 'Vila Mariana кооперативі (1,4 км) · Pinheiros экобекеті (1,9 км)';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Өсімдік қалдығы — ' || left(v_orig_caption, 96);
      v_instructions := '1. Пластик жапсырмаларды алып тастаңыз. 2. Құрғақ жапырақтармен 1:2 қатынасында араластырыңыз. 3. Қоғамдық немесе үй компостеріне жіберіңіз.';
      v_material := 'Лигноцеллюлозалық биомасса және крахмалды қалдықтар (C:N ~25:1)';
      v_subs := 'Процесс: Аэробты компосттау немесе вермикомпост · Цикл: 60–90 күн · Шектеу: Пластик, шыны және май қоспау';
      v_price := 'Шығымы ~0,5 кг гумус / кг';
      v_places := 'Butantã қоғамдық бағы (0,4 км) · Pinheiros компост алаңы (1,7 км)';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'Электрондық компонент (ЭҚҚ) — ' || left(v_orig_caption, 96);
      v_instructions := '1. Аккумулятор түйіспелерін оқшаулағыш таспамен жабыңыз. 2. Тұрмыстық қоқысқа тастамаңыз. 3. Арнайы қабылдау бекетіне тапсырыңыз.';
      v_material := 'Мыс өткізгіштер, литий ұяшықтары және термопластик корпус';
      v_subs := 'Процесс: Металдарды гидрометаллургиялық бөліп алу · Норма: ЭҚҚ · Шектеу: Тесілгенде тұтану қаупі бар';
      v_price := '2,80 $ / кг бағалы металдар';
      v_places := 'Paulista жасыл бекеті (0,3 км) · Pinheiros экобекеті (1,9 км)';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Күйдірілген керамика — ' || left(v_orig_caption, 96);
      v_instructions := '1. Өткір сынықтарды қалың картонға орап, белгі қойыңыз. 2. Шыны қалдықтарымен араластырмаңыз. 3. Инертті материалдар бөліміне тапсырыңыз.';
      v_material := 'Жоғары температурада күйдірілген глазурленген керамика';
      v_subs := 'Процесс: Минералды қиыршық тасқа ұсақтау · Норма: II-B класты инертті · Шектеу: Ыдыс шынысымен араластырмау';
      v_price := 'Минералды толтырғыш ретінде кәдеге жарату';
      v_places := 'Pinheiros экобекеті — Инертті материалдар бөлімі (1,2 км)';
    ELSE
      v_caption := 'Қалдық фракциясы — ' || left(v_orig_caption, 96);
      v_instructions := '1. Берік пакетке салып, аузын мықтап байлаңыз. 2. Макулатура мен компостқа қоспаңыз. 3. Муниципалды қоқыс контейнеріне тастаңыз.';
      v_material := 'Көпқабатты композит және май сіңген целлюлоза';
      v_subs := 'Процесс: Санитарлық полигонға көму · Шектеу: Құрғақ қағаз бен компостқа қоспау';
      v_price := 'Қайталама шикізат құны жоқ';
      v_places := 'Муниципалды тұрмыстық қалдықтарды шығару';
    END IF;
  ELSE
    IF v_label = 'recyclable' THEN
      v_caption := 'Verified Packaging — ' || left(v_orig_caption, 96);
      v_instructions := '1. Empty any remaining liquid and briefly rinse residue. 2. Crush or flatten to save collection volume. 3. Place in the dry recyclables stream or drop off at a sorting cooperative.';
    ELSIF v_label = 'organic' THEN
      v_caption := 'Compostable Fraction — ' || left(v_orig_caption, 96);
      v_instructions := '1. Remove any plastic stickers, twist-ties, or packaging. 2. Layer 1:2 with dry leaves or sawdust to balance carbon and moisture. 3. Route to a household worm bin or community compost hub.';
    ELSIF v_label = 'eletronic' THEN
      v_caption := 'E-Waste Component — ' || left(v_orig_caption, 96);
      v_instructions := '1. Insulate exposed battery terminals with non-conductive tape. 2. Never place in household trash or compactors due to fire risk. 3. Deliver to a certified e-waste reverse-logistics drop-off point.';
    ELSIF v_label = 'non_recyclable' THEN
      v_caption := 'Inert Mineral Item — ' || left(v_orig_caption, 96);
      v_instructions := '1. Wrap sharp edges or shards in thick labelled cardboard. 2. Keep out of glass bins to avoid furnace contamination. 3. Deliver to the municipal inert mineral drop-off bay.';
    ELSE
      v_caption := 'Residual Fraction — ' || left(v_orig_caption, 96);
      v_instructions := '1. Seal inside a leak-proof bag. 2. Keep strictly separate from dry paper and organic compost bins. 3. Place in regular municipal waste collection.';
    END IF;
  END IF;

  -- Preserve specimen-specific composition, yield, and neighbourhood locations on real camera/uploaded photos
  -- rather than substituting seeded São Paulo fixture attributes.
  IF NEW.language <> v_source_lang AND coalesce(v_picture, '') NOT LIKE '/pictures/%' THEN
    v_caption := left(v_orig_caption, 160);
    v_material := coalesce(nullif(v_orig_material, ''), v_material);
    v_subs := coalesce(nullif(v_orig_subs, ''), v_subs);
    v_price := coalesce(nullif(v_orig_price, ''), v_price);
    v_places := coalesce(nullif(v_orig_places, ''), v_places);
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

REVOKE EXECUTE ON FUNCTION translate_trash_item() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS translation_request_translate ON translation_request;
CREATE TRIGGER translation_request_translate
  AFTER INSERT ON translation_request
  FOR EACH ROW
  EXECUTE FUNCTION translate_trash_item();

COMMIT;
