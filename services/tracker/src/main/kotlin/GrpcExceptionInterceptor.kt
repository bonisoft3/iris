package com.trash.services.tracker

import io.grpc.ForwardingServerCall
import io.grpc.Metadata
import io.grpc.ServerCall
import io.grpc.ServerCallHandler
import io.grpc.ServerInterceptor
import io.grpc.Status
import io.github.oshai.KotlinLogging
import jakarta.inject.Singleton

/**
 * Log all exceptions thrown from gRPC endpoints, and adjust Status for known exceptions.
 * See https://github.com/grpc/grpc-kotlin/issues/141#issuecomment-726829195 for details.
 */
@Singleton
class GrpcExceptionInterceptor : ServerInterceptor {
  /**
   * When closing a gRPC call, extract any error status information to top-level fields. Also
   * log the cause of errors.
   */
  private class ExceptionTranslatingServerCall<ReqT, RespT>(
    delegate: ServerCall<ReqT, RespT>
  ) : ForwardingServerCall.SimpleForwardingServerCall<ReqT, RespT>(delegate) {
    private val logger = KotlinLogging.logger {}

    override fun close(status: Status, trailers: Metadata) {
      if (status.isOk) {
        return super.close(status, trailers)
      }
      val cause = status.cause
      var newStatus = status

      logger.error(cause) { "Error handling gRPC endpoint." }

      if (status.code == Status.Code.UNKNOWN) {
        val translatedStatus = when (cause) {
          is IllegalArgumentException -> Status.INVALID_ARGUMENT
          is IllegalStateException -> Status.FAILED_PRECONDITION
          else -> Status.UNKNOWN
        }
        newStatus = translatedStatus.withDescription(cause?.message).withCause(cause)
      }

      super.close(newStatus, trailers)
    }
  }

  override fun <ReqT : Any, RespT : Any> interceptCall(
    call: ServerCall<ReqT, RespT>,
    headers: Metadata,
    next: ServerCallHandler<ReqT, RespT>
  ): ServerCall.Listener<ReqT> {
    return next.startCall(ExceptionTranslatingServerCall(call), headers)
  }
}
