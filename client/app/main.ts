import * as Rx from 'rxjs';

import { getScheduler } from './scheduler';

export const stream = Rx.Observable.interval(500, getScheduler());
