import { IScheduler } from 'rxjs/Scheduler';
import { TestScheduler } from './TestScheduler';

const scheduler:IScheduler = new TestScheduler();
export const getScheduler = ():IScheduler => scheduler;
