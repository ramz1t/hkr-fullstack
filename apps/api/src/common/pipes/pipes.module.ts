import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { API_ERRORS } from "@repo/types";

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          exceptionFactory: (validationErrors) => {
            const details = validationErrors.map((err) => ({
              field: err.property,
              value: err.value
            }));
            const apiError = API_ERRORS.VALIDATION_FAILED;
            apiError.details = details;
            return apiError;
          }
        })
    }
  ]
})
export class PipesModule {}
