import { ConfigurableModuleBuilder } from '@nestjs/common';
import { JobsModuleConfig } from './job-module-config';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<JobsModuleConfig>()
    .setClassMethodName('forRoot')
    .build();
