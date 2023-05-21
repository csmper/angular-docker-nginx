import { Injectable } from '@angular/core';
import { Faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

@Injectable({
  providedIn: 'root'
})
export class ObservabilityService {
  faro!: Faro;
  constructor() { }

  setup() {
    this.faro = initializeFaro({
      url: 'https://faro-collector-prod-ap-south-0.grafana.net/collect/a562f85cb6861cfa65c1c748ac3e0493',
      app: {
        name: 'angular-grafana-faro-test',
        version: '1.0.0',
        environment: 'production'
      },
      instrumentations: [
        // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
        ...getWebInstrumentations({
          captureConsole: true,
          captureConsoleDisabledLevels: [],
        }),

        // Initialization of the tracing package.
        // This packages is optional because it increases the bundle size noticeably. Only add it if you want tracing data.
        new TracingInstrumentation(),
      ],
    });
    this.tracing();
  }

  tracing() {
    const otelApi = this.faro.api.getOTEL();
    console.log(otelApi)
    if(otelApi) {
      const tracer = otelApi.trace.getTracer('default');
      const span = tracer.startSpan('click');
  
      otelApi.context.with(otelApi.trace.setSpan(otelApi.context.active(), span), () => {
        this.faro.api.pushLog(['tracing log']);
        span.end();
      });
    }
  }
}
