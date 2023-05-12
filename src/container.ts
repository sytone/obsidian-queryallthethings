import { Container } from 'brandi';
import { QattLogger } from 'lib/logging';

import { TOKENS } from './tokens';

export const container = new Container();

container
    .bind(TOKENS.logger)
    .toInstance(QattLogger)
    .inSingletonScope();
