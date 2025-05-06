package com.trash.services.tracker

import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.uuid.Generators
import com.google.protobuf.Timestamp
import com.google.protobuf.util.JsonFormat
import com.google.type.Money
import com.trash.libraries.pbtables.db.DonatesQueries
import com.trash.libraries.pbtables.db.TrashItemQueries
import com.trash.libraries.pbtables.db.TrashItemTranslationsQueries
import com.trash.libraries.pbtables.db.UserIrisQueries
import com.trash.tracker.v1.*
import com.trash.tracker.v1.PlaceOpenRequest
import com.trash.tracker.v1.PlaceOpenResponse
import io.github.oshai.KotlinLogging
import io.micronaut.context.annotation.Value
import io.micronaut.core.annotation.Introspected
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import io.micronaut.http.MediaType
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.Header
import io.micronaut.http.annotation.Post
import io.micronaut.http.client.annotation.Client
import io.micronaut.objectstorage.ObjectStorageOperations
import io.micronaut.objectstorage.request.UploadRequest
import io.micronaut.serde.annotation.Serdeable
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.time.Instant
import java.time.ZoneOffset
import java.util.*
import java.util.Locale
import javax.sql.DataSource
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.*
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

import java.time.OffsetDateTime

@Serializable data class PlaceOpenRes(val result: PlaceOpenResult)

@Serializable
data class PlaceOpenResult(@SerialName("opening_hours") val openingHours: PlaceTimings? = null)

@Serializable data class PlaceTimings(@SerialName("open_now") val openNow: Boolean = false)

@Serializable data class Choices(val message: Message)

@Serializable data class Message(val role: String, val content: String)

@Introspected
@Serdeable
data class PalmCandidate(
    @JsonProperty("content") val content: String,
    @JsonProperty("author") val author: String
)

@Introspected
@Serdeable
data class VertexPredictions(
    @JsonProperty("candidates") val candidates: List<PalmCandidate>,
    @JsonProperty("safetyAttributes") val safetyAttributes: Any,
    @JsonProperty("citationMetadata") val citationMetadata: Any
)

@Serializable
data class SafeSearchAnnotation(
    val adult: String,
    val spoof: String,
    val medical: String,
    val violence: String,
    val racy: String
)

@Serdeable
@Introspected
data class GoogleVertexPalmResponse(
    @JsonProperty("predictions") val predictions: List<VertexPredictions>,
    @JsonProperty("metadata") val metadata: Any
)

@Client("\${iris.google-api-url}")
interface GoogleVertexPalmAPI {
  @Post("\${iris.google-vertex-palm-api-endpoint}")
  suspend fun reqPalm(
      @Body json: String,
      @Header("Authorization") bearer: String,
      @Header("Content-Type") contentType: String
  ): GoogleVertexPalmResponse
}

@Client("\${iris.cloud-compute-metadata-url}")
interface CloudComputeTokenInterface {
  @Get("\${iris.cloud-compute-metadata-endpoint}")
  suspend fun getBearerToken(
      @Header("Metadata-Flavor") metadataFlavor: String
  ): CloudComputeTokenResponse
}

@Serdeable
@Introspected
data class CloudComputeTokenResponse(
    @JsonProperty("access_token") val token: String,
    @JsonProperty("expires_in") val expiresIn: Int,
    @JsonProperty("token_type") val tokenType: String
)

@Serializable data class SingleSafeSearchResponse(val safeSearchAnnotation: SafeSearchAnnotation)

@Serializable data class SafeSearchResponse(val responses: List<SingleSafeSearchResponse>)

@Serializable
data class Translation(
    @JsonProperty("translatedText") val translatedText: String,
)

@Serializable
data class Translations(@JsonProperty("translations") val translations: List<Translation>)

@Serializable data class TranslationResponse(@JsonProperty("data") val data: Translations)

@Serializable data class PlacesTextResponse(val results: List<PlaceTextResponseResults>)

@Serializable
data class PlaceTextResponseResults(
    val name: String,
    @SerialName("formatted_address") val formattedAddress: String,
    @SerialName("place_id") val placeId: String,
    val geometry: Geometry
)

@Serializable
data class Geometry(
    val location: Location,
)

@Serializable data class Location(val lat: Double, val lng: Double)

data class Geolocation(val latitude: Double, val longitude: Double)

data class NearbyPlace(
    val name: String,
    val formattedAddress: String,
    val distance: String,
    val placeId: String,
    val phoneNumber: String?
)

@Serializable data class PlaceDetailsResponse(val result: PlaceDetailsResult)

@Serializable
data class PlaceDetailsResult(
    @SerialName("formatted_phone_number") val formattedPhoneNumber: String = ""
)

@Serializable data class GptPriceJson(@SerialName("price") val price: Long = 0)

@Singleton
@Suppress("unused")
class TrackerEndpoint(
    @field:Inject private val dataSource: DataSource,
    @field:Inject private val objectStorage: ObjectStorageOperations<*, *, *>,
    private val googleVertexPalmAPI: GoogleVertexPalmAPI,
    private val cloudComputeTokenInterface: CloudComputeTokenInterface,
    @field:Inject private val geminiClient: GeminiClient,
    @field:Inject private val openAIClient: OpenAIClient,
    @field:Inject private val chatCompletionClientFactory: ChatCompletionClientFactory,
    @field:Inject @Value("\${iris.storage-url}") private val storageUrl: String,
    @field:Inject @Value("\${google.places.key}") private val placesApiKey: String,
    @field:Inject @Value("\${iris.google-vision-api-url}") private val googleVisionApiUrl: String,
    @field:Inject
    @Value("\${iris.google-annotate-endpoint}")
    private val googleAnnotateEndpoint: String,
    @field:Inject @Value("\${iris.google-translation-url}") private val translationApiUrl: String,
    @field:Inject @Value("\${iris.google-translation-api-endpoint}") private val translationApiEndpoint: String,
    @field:Inject @Value("\${iris.google-maps-api-url}") private val mapsApiUrl: String,
    @field:Inject @Value("\${prompt-path-prefix}") private val promptPathPrefix: String
) : TrackerServiceGrpcKt.TrackerServiceCoroutineImplBase() {
  private val jsonPrinter = JsonFormat.printer()
  private val jsonParser = JsonFormat.parser()
  private val driver = (dataSource as DelegatingDataSource).targetDataSource.asJdbcDriver()
  private val trashItemQueries = TrashItemQueries(driver)
  private val userIrisQueries = UserIrisQueries(driver)
  private val donatesQueries = DonatesQueries(driver)
  private val trashItemTranslationsQueries = TrashItemTranslationsQueries(driver)
  private val uuidGenerator = Generators.timeBasedGenerator()
  private val logger = KotlinLogging.logger {}
  private val client = OkHttpClient()
  private val json = Json { ignoreUnknownKeys = true }

  override suspend fun placeOpen(request: PlaceOpenRequest): PlaceOpenResponse {
    val url =
        mapsApiUrl + "/maps/api/place/details/json?placeid=${request.placeId}&fields=opening_hours&key=${placesApiKey}"
    val apiRequest = Request.Builder().url(url).build()

    client.newCall(apiRequest).execute().use { response ->
      if (!response.isSuccessful) return placeOpenResponse { open = false }
      val jsonResponse = json.decodeFromString<PlaceOpenRes>(response.body!!.string())

      return placeOpenResponse { open = jsonResponse.result.openingHours?.openNow ?: false }
    }
  }

  private fun haversine(geo1: Geolocation, geo2: Geolocation): Double {
    val earthRadius = 6371.0

    val latDistance = Math.toRadians(geo2.latitude - geo1.latitude)
    val lonDistance = Math.toRadians(geo2.longitude - geo1.longitude)
    val a =
        sin(latDistance / 2).pow(2) +
            cos(Math.toRadians(geo1.latitude)) *
                cos(Math.toRadians(geo2.latitude)) *
                sin(lonDistance / 2).pow(2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earthRadius * c
  }

  override suspend fun getUserInfo(request: UserInfoRequest): UserInfoResponse {
    val user = userIrisQueries.selectById(request.userId).executeAsOne()

    return userInfoResponse {
      address = user.homeAddress ?: ""
      addressComplement = user.addressComplement ?: ""
      phoneNumber = user.phoneNumber ?: ""
    }
  }

  private fun getNearbyRecyclingCenters(
      objectMainMaterial: String,
      latitude: Double,
      longitude: Double,
      placesApiKey: String
  ): List<NearbyPlace>? {
    val url =
        mapsApiUrl + "/maps/api/place/textsearch/json?query=recycling+center+${objectMainMaterial.removeSuffix(".").lowercase()}&location=${latitude},${longitude}&key=${placesApiKey}&rankby=distance"

    val request = Request.Builder().url(url).build()
    client.newCall(request).execute().use { response ->
      if (!response.isSuccessful) return null
      val places = json.decodeFromString<PlacesTextResponse>(response.body!!.string())
      val userPosition = Geolocation(latitude, longitude)
      val radius = 5

      val nearbyRecyclingCenters =
          places
              .results
              .filter { place ->
                val placeLocation =
                    Geolocation(place.geometry.location.lat, place.geometry.location.lng)
                val distance = haversine(userPosition, placeLocation)
                distance <= radius
              }
              .map { place ->
                val placeLocation =
                    Geolocation(place.geometry.location.lat, place.geometry.location.lng)
                val distance =
                    String.format(Locale.US, "%.2f", haversine(userPosition, placeLocation))
                NearbyPlace(
                    place.name,
                    place.formattedAddress,
                    "$distance km",
                    place.placeId,
                    getPhoneNumberFromPlace(place.placeId, placesApiKey)
                )
              }
              .take(4)

      return nearbyRecyclingCenters
    }
  }

  private fun getPhoneNumberFromPlace(placeId: String, placesApiKey: String): String {
    val url =
        mapsApiUrl + "/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${placesApiKey}"

    val request = Request.Builder().url(url).build()
    client.newCall(request).execute().use { response ->
      if (!response.isSuccessful) return ""
      val places = json.decodeFromString<PlaceDetailsResponse>(response.body!!.string())
      return places.result.formattedPhoneNumber
    }
  }

  override suspend fun dropout(request: DropoutRequest): DropoutResponse {
    trashItemQueries.dropout(request.userId)
    return DropoutResponse.newBuilder().setUserId(request.userId).build()
  }

  override suspend fun translateOnDemand(request: TranslateRequest): TranslateResponse {
    val targetLanguage = request.targetLanguage
    val itemId = request.itemId
    val hasTranslation = trashItemTranslationsQueries
    .selectTranslation(UUID.fromString(itemId), targetLanguage)
    .executeAsList()
    .firstOrNull()
    logger.info("Translation for item $itemId and language $targetLanguage = $hasTranslation")
    if (hasTranslation != null) {
         logger.info("Translation already exists for item $itemId")
        return translateResponse {
            translationId = hasTranslation.id.toString()
        }
    }
    val tokInterface = cloudComputeTokenInterface.getBearerToken("Google")
    val bearerToken = "Bearer ${tokInterface.token}"
    val trashItemPb = trashItemQueries.selectById(UUID.fromString(itemId)).executeAsOne()
    val trashItem = TrashItem.newBuilder()
    jsonParser.merge(trashItemPb.pbjson, trashItem)
    val translations = trashItemTranslations {
      caption = translateText(trashItem.caption, targetLanguage, bearerToken)
      disposalInstructions =
          translateText(trashItem.disposalInstructions, targetLanguage, bearerToken)
    }
    val id = uuidGenerator.generate().toString()
    trashItemTranslationsQueries.insert(
        UUID.fromString(id),
        UUID.fromString(trashItem.id),
        targetLanguage,
        jsonPrinter.print(translations)
    )
    return translateResponse { translationId = id }
  }

  override suspend fun userAlreadyAskedForThisItem(
      request: DonationsLookup
  ): AlreadyAskedForThisItem {
    logger.info("did I even arrive here?")
    val queryDonates = donatesQueries.selectById(request.userId)
    val donates = queryDonates.executeAsList()

    return alreadyAskedForThisItem {
      alreadyAskedForThisItem = donates.any { donate -> donate.itemId.equals(request.itemId) }
    }
  }

  override suspend fun registerDonation(request: DonationRequest): DonationResponse {
    val itemId = uuidGenerator.generate()

    donatesQueries.insert(itemId, request.firebaseId, request.itemId)

    return donationResponse { donationId = itemId.toString() }
  }

  override suspend fun saveUser(request: UserIrisRequest): UserIrisResponse {
    val itemId = uuidGenerator.generate()
    val date = Date()
    val offsetDateTime = date.toInstant().atOffset(ZoneOffset.UTC)

    userIrisQueries.insert(
        itemId,
        offsetDateTime,
        request.user.firebaseId,
        request.user.phoneNumber,
        request.user.homeAddress,
        request.user.addressComplement
    )

    return userIrisResponse { id = itemId.toString() }
  }

  override suspend fun editUser(request: UserIrisRequest): UserIrisResponse {
    // Assuming firebaseId is a unique identifier for each user
    userIrisQueries.updateById(
        phoneNumber = request.user.phoneNumber,
        homeAddress = request.user.homeAddress,
        addressComplement = request.user.addressComplement,
        firebaseId = request.user.firebaseId,
    )

    // Return a success response
    return userIrisResponse { id = request.user.firebaseId } // Assuming firebaseId is unique and can serve as the ID in the response
}

  override suspend fun track(request: TrackRequest): TrackResponse {
    val itemIdRaw = uuidGenerator.generate();
    val itemId =  itemIdRaw.toString()
    val itemDefaults: TrashItem = trashItem {
      id = itemId
      ts = Timestamp.newBuilder().setSeconds(Instant.now().epochSecond).build()
      userId = request.item.userId
      userLanguage = request.item.userLanguage
    }
    val model = request.item.model
    logger.info("Model is $model")
    val base64 = request.item.picture.substring(request.item.picture.indexOf(",") + 1)
    val imageForModel = returnImageBase64(request.item.picture, model)
    val modelChatClient = chatCompletionClientFactory.getClient(model)
    val decoded = Base64.getMimeDecoder().decode(base64)

    val uploadRequest = UploadRequest.fromBytes(decoded, "$itemId.jpg", "image/jpeg")
    withContext(Dispatchers.IO) {
      objectStorage.upload(uploadRequest)
    }
    val imgUrl = "$storageUrl$itemId.jpg"

    // Salva o item com as informações básicas
    val item = request.item.toBuilder().mergeFrom(itemDefaults).setPicture(imgUrl).build()
    trashItemQueries.insert(UUID.fromString(itemId), jsonPrinter.print(item))

    // Faz as requisições para obter as informações adicionais
    val tokInterface = cloudComputeTokenInterface.getBearerToken("Google")
    val bearerToken = "Bearer ${tokInterface.token}"
    val estimatedValue = getEstimatedValue(imageForModel, modelChatClient)
    val mainMaterial = getMaterialOfDetectedObject(imageForModel, modelChatClient)
    val nearbyRecyclingCenters = getNearbyRecyclingCenters(mainMaterial, request.item.latlng.latitude, request.item.latlng.longitude, placesApiKey)
    val safeSearchResponse = getSafeSearchResponse(base64, bearerToken)
    val detectedObject = getDetectedObject(imageForModel, modelChatClient)
    val disposalInstructions = getDisposalInstructionsForObject(detectedObject, modelChatClient)
    val label = getLabelForObject(detectedObject, modelChatClient)
    val subClassifications = getSubClassifications(detectedObject, modelChatClient)
    val nearbyRecyclingPlacesList = nearbyRecyclingCenters?.map { recyclingCenter ->
      NearbyRecyclingPlaces.newBuilder()
        .setName(recyclingCenter.name)
        .setDistance(recyclingCenter.distance)
        .setFormattedAddress(recyclingCenter.formattedAddress)
        .setPhoneNumber(recyclingCenter.phoneNumber)
        .setPlaceId(recyclingCenter.placeId)
        .build()
    } ?: emptyList()
    val isDisposalPlaceResponse: Boolean = detectDisposalPlace(imageForModel, modelChatClient)

    // Atualiza o item com as informações adicionais
    val updatedItem = item.toBuilder()
      .addAllNearbyRecyclingPlaces(nearbyRecyclingPlacesList)
      .setLabel(label)
      .setCaption(detectedObject)
      .setIsDisposalPlace(isDisposalPlaceResponse)
      .setDisposalInstructions(disposalInstructions)
      .setLabel(label)
      .setTaggedAsInnapropriate(isImageInappropriate(safeSearchResponse))
      .setSubClassifications(subClassifications)
      .setPrice(Money.newBuilder().setCurrencyCode("USD").setUnits(estimatedValue))
      .build()

	  val offsetDateTime = OffsetDateTime.ofInstant(
		  Instant.ofEpochSecond(updatedItem.ts.seconds, updatedItem.ts.nanos.toLong()),
		  ZoneOffset.UTC
	  )

	  try {
		trashItemQueries.update(
			jsonPrinter.print(updatedItem),
			updatedItem.picture.toByteArray(),
			offsetDateTime,
			itemIdRaw
		)
	} catch (e: Exception) {
		logger.error("Failed to update trash item", e)
	}

    logger.info(
      "Got item: item.id=${updatedItem.id}" +
        "\nitem.caption=${updatedItem.caption}" +
        "\nitem.disposalInstructions=${updatedItem.disposalInstructions}" +
        "\nitem.subClassifications=${updatedItem.subClassifications}" +
        "\nitem.ts=${updatedItem.ts.seconds} " +
        "\nitem.description=${updatedItem.description}" +
        "\nitem.picture=${updatedItem.picture} " +
        "\nitem.label=${updatedItem.label} " +
        "\nitem.isDisposalPlace=${updatedItem.isDisposalPlace}" +
        "\nItem is tagged? ${updatedItem.taggedAsInnapropriate}" +
        "\nUser located in ${request.item.userCity}" +
        "\nPrice of the item is ${updatedItem.price}"
    )

    return trackResponse {
      id = updatedItem.id
      isDisposalPlace = updatedItem.isDisposalPlace
    }
}

  private fun getSafeSearchResponse(base64: String, bearerToken: String): SafeSearchResponse? {
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val requestBody =
        JsonHelper.getJsonContentFromPath("classpath:prompts/bodySafeSearch.json", "base64", base64)
    val body = requestBody.toRequestBody(mediaType)
    val url = "$googleVisionApiUrl$googleAnnotateEndpoint"

    val request =
        Request.Builder()
            .url(url)
            .post(body)
            .addHeader("Authorization", bearerToken)
            .addHeader("x-goog-user-project", "trash-362115")
            .build()

    client.newCall(request).execute().use { response ->
      if (!response.isSuccessful) return null

      return json.decodeFromString<SafeSearchResponse>(response.body!!.string())
    }
  }

  private fun isImageInappropriate(safeSearchResponse: SafeSearchResponse?): Boolean {
    safeSearchResponse ?: return false
    if (safeSearchResponse.responses.isEmpty()) return false
    val annotation = safeSearchResponse.responses[0].safeSearchAnnotation
    return listOf(
            annotation.adult,
            annotation.spoof,
            annotation.medical,
            annotation.violence,
            annotation.racy
        )
        .any { it in listOf("LIKELY", "VERY_LIKELY") }
  }

  private fun translateText(text: String, targetLanguage: String, bearerToken: String): String {
    val replacements = mapOf("ORIGINAL_MESSAGE" to text, "TARGET_LANGUAGE" to targetLanguage)
    val translationJson =
        JsonHelper.getJsonContentFromPath(
            "classpath:api_requests/translation_request.json",
            replacements
        )
    val requestBody = translationJson.toRequestBody("application/json; charset=utf-8".toMediaType())
    val request =
        Request.Builder()
            .url("$translationApiUrl$translationApiEndpoint")
            .post(requestBody)
            .header("Authorization", bearerToken)
            .header("x-goog-user-project", "trash-362115")
            .build()
    val response = client.newCall(request).execute()
    val responseBody = response.body?.string()
    val translationResponse = Json.decodeFromString<TranslationResponse>(responseBody.orEmpty())
    val translatedText = translationResponse.data.translations.firstOrNull()?.translatedText
    return translatedText ?: ""
  }

  private suspend fun getDetectedObject(caption: String, bearerToken: String): String {
    val requestBody =
        JsonHelper.getJsonContentFromPath(
            "classpath:prompts/palm_filter_info.json",
            "visualCaptioningResponse",
            caption
        )
    val palmFilterInfoRes =
        googleVertexPalmAPI.reqPalm(requestBody, bearerToken, MediaType.APPLICATION_JSON)

    return palmFilterInfoRes.predictions[0].candidates[0].content
  }


  private suspend fun getTranslatedDisposalInstructionsForObject(
      detectedObject: String,
      bearerToken: String,
      targetLanguage: String
  ): String {
    val requestBody =
        JsonHelper.getJsonContentFromPath(
            "classpath:prompts/palm_disposal_instructions.json",
            "detectedObject",
            detectedObject
        )
    val disposalResponse =
        googleVertexPalmAPI.reqPalm(requestBody, bearerToken, MediaType.APPLICATION_JSON)
    val disposalInstructions = disposalResponse.predictions[0].candidates[0].content
    if (targetLanguage == "en") return disposalInstructions
    val splitInstructions = disposalInstructions.split('\n').map { "\"$it\"" }
    return translateText(splitInstructions.joinToString(), targetLanguage, bearerToken)
  }

  private suspend fun getTranslatedSubClassifications(
      detectedObject: String,
      bearerToken: String,
      targetLanguage: String
  ): String {
    val requestBody =
        JsonHelper.getJsonContentFromPath(
            "classpath:prompts/palm_sub_classification.json",
            "detectedObject",
            detectedObject
        )
    val subClassificationsResponse =
        googleVertexPalmAPI.reqPalm(requestBody, bearerToken, MediaType.APPLICATION_JSON)
    val subClassifications = subClassificationsResponse.predictions[0].candidates[0].content
    return if (targetLanguage == "en") subClassifications
    else translateText(subClassifications, targetLanguage, bearerToken)
  }

  private fun getTranslatedDetectedObject(
      detectedObject: String,
      bearerToken: String,
      targetLanguage: String
  ): String {
    return if (targetLanguage == "en") detectedObject
    else translateText(detectedObject, targetLanguage, bearerToken)
  }

  private fun getEstimatedValue(base64: String, chatCompletion: ChatCompletionClient): Long {
    val promptPath = "get_price.json"
    val replacements = mapOf("BASE64_IMAGE" to base64)

    val result = chatCompletion.getChatCompletion(promptPath, replacements)

    return result.toDoubleOrNull()?.toLong() ?: 0L
}

  private fun getMaterialOfDetectedObject(base64: String, chatCompletion: ChatCompletionClient): String {
    val promptPath = "main_material.json"
    val replacements = mapOf("BASE64_IMAGE" to base64)

    return chatCompletion.getChatCompletion(promptPath, replacements)
  }

  private fun getDetectedObject(base64: String, chatCompletion: ChatCompletionClient): String {
    val promptPath = "main_object.json"
    val replacements = mapOf("BASE64_IMAGE" to base64)

    return chatCompletion.getChatCompletion(promptPath, replacements)
  }

  private fun getSubClassifications(objectName: String, chatCompletion: ChatCompletionClient): String {
    val promptPath = "sub_classifications.json"
    val replacements = mapOf("PLACEHOLDER" to objectName)

    return chatCompletion.getChatCompletion(promptPath, replacements)
  }

  private fun getDisposalInstructionsForObject(objectName: String, chatCompletion: ChatCompletionClient): String {
    val promptPath = "disposal_instructions.json"
    val replacements = mapOf("PLACEHOLDER" to objectName)

    return chatCompletion.getChatCompletion(promptPath, replacements)
  }

  private fun getLabelForObject(objectName: String, chatCompletion: ChatCompletionClient): String {
    val promptPath = "classification.json"
    val replacements = mapOf("PLACEHOLDER" to objectName)

    return chatCompletion.getChatCompletion(promptPath, replacements)
  }

  private fun detectDisposalPlace(base64: String, chatCompletion: ChatCompletionClient): Boolean {
    val promptPath = "detect_disposal_place.json"
    val replacements = mapOf("BASE64_IMAGE" to base64)
    val response = chatCompletion.getChatCompletion(promptPath, replacements)

    return response.contains("yes", ignoreCase = true)
 }

 private fun returnImageBase64(image: String, model: String): String {
    return if (model != "openai") image.substring(image.indexOf(",") + 1) else image
  }
}
