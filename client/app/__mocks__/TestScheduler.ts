import { IScheduler } from 'rxjs/Scheduler';
import { VirtualTimeScheduler } from "rxjs/scheduler/VirtualTimeScheduler";
import { AsyncAction } from "rxjs/scheduler/AsyncAction";
import { HotObservable } from 'rxjs/testing/HotObservable';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { TestMessage } from 'rxjs/testing/TestMessage';
import { Notification } from 'rxjs/Notification';
import { SynchronousPromise } from 'synchronous-promise';

export class TestScheduler extends VirtualTimeScheduler implements IScheduler {

  static onNext(frame:number, data?:any):TestMessage {
    return {
      frame,
      notification: Notification.createNext(data)
    };
  }

  static onError(frame:number, error?:any):TestMessage {
    return {
      frame,
      notification: Notification.createError(error)
    };
  }

  static onComplete(frame:number):TestMessage {
    return {
      frame,
      notification: Notification.createComplete()
    };
  }

  advanceBy(frames:number) {
    this.advanceTo(this.frame + frames);
  }

  advanceTo(frame:number) {
    if (this.frame > frame) {
      throw new Error(`TestScheduler cannot go back in time (attempting to go from t=${this.frame} to t=${frame})`);
    }

    this.frame = frame;
    this.flush();
  }

  reset() {
    this.frame = 0;
    this.index = -1;
    this.actions.forEach((action) => action.unsubscribe());
    this.actions = [];
    this.flush();
  }

  flush() {
    let action:AsyncAction<any>;
    while ((action = this.actions.shift())) {
      const isActionDue = action.delay <= this.frame;
      if (!isActionDue) {
        this.actions.unshift(action);
        break;
      }

      const error = action.execute(action.state, action.delay);
      if (error) {
        this.reset();
        console.error(`TestScheduler encountered an error executing action at t=${action.delay}`);
        console.error(error);
        throw new Error(`TestScheduler encountered an error executing action at t=${action.delay}`);
      }
    }
  }

  createColdObservable<T>(...messages:TestMessage[]):ColdObservable<T> {
    const cold = new ColdObservable<T>(messages, this);
    return cold;
  }

  createHotObservable<T>(...messages:TestMessage[]):HotObservable<T> {
    const hot = new HotObservable<T>(messages, this);
    hot.setup();
    return hot;
  }

  createResolvedPromise<T>(frame:number, data?:any):Promise<T> {
    return new SynchronousPromise((resolve) => {
      this.schedule(() => resolve(data), frame);
    });
  }

  createRejectedPromise<T>(frame, error?:any):Promise<T> {
    return new SynchronousPromise((resolve, reject) => {
      this.schedule(() => reject(error), frame);
    });
  }

}
