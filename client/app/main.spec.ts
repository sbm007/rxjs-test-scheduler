jest.mock('./scheduler');

import { TestScheduler } from "./__mocks__/TestScheduler";
import { getScheduler } from './scheduler';

import { Observable } from "rxjs/Observable";
import { stream } from './main';

describe('main', () => {
  it('should let you control the virtual clock manually', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    stream.subscribe(onNext, onError, onComplete);

    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(499);
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(500);
    expect(onNext).toHaveBeenCalledWith(0);

    scheduler.advanceTo(999);
    expect(onNext).toHaveBeenCalledWith(0);

    scheduler.advanceTo(1000);
    expect(onNext).toHaveBeenCalledWith(1);

    scheduler.advanceTo(1500);
    expect(onNext).toHaveBeenCalledWith(2);

    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should work with hot observables', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    const mockStream = scheduler.createHotObservable(
      TestScheduler.onNext(200, 'hello world'),
      TestScheduler.onError(300, 'something went wrong!')
    );

    mockStream.subscribe(onNext, onError, onComplete);

    scheduler.flush();
    expect(onNext).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    scheduler.advanceTo(199);
    expect(onNext).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    scheduler.advanceTo(200);
    expect(onNext).toHaveBeenCalledWith('hello world');
    expect(onError).not.toHaveBeenCalled();

    scheduler.advanceTo(300);
    expect(onError).toHaveBeenCalledWith('something went wrong!');

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should work with hot observables', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    const mockStream = scheduler.createHotObservable(
      TestScheduler.onNext(200, 'hello world'),
      TestScheduler.onComplete(300)
    );

    mockStream.subscribe(onNext, onError, onComplete);

    scheduler.flush();
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(199);
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(200);
    expect(onNext).toHaveBeenCalledWith('hello world');

    scheduler.advanceTo(300);
    expect(onComplete).toHaveBeenCalled();

    expect(onError).not.toHaveBeenCalled();
  });

  it('should work with cold observables', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    const mockStream = scheduler.createColdObservable(
      TestScheduler.onNext(200, 'hello world')
    );

    mockStream.subscribe(onNext, onError, onComplete);

    scheduler.flush();
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(199);
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(200);
    expect(onNext).toHaveBeenCalledWith('hello world');

    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should work with promises', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    const mockPromise = scheduler.createResolvedPromise(200, 'hello world');

    Observable.fromPromise(mockPromise)
      .subscribe(onNext, onError, onComplete);

    scheduler.flush();
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(199);
    expect(onNext).not.toHaveBeenCalled();

    scheduler.advanceTo(200);
    expect(onNext).toHaveBeenCalledWith('hello world');

    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('should work with rejected promises', () => {
    const scheduler = getScheduler() as TestScheduler;
    scheduler.reset();

    const onNext = jest.fn();
    const onError = jest.fn();
    const onComplete = jest.fn();

    const mockPromise = scheduler.createRejectedPromise(200, 'something went wrong!');

    Observable.fromPromise(mockPromise)
      .subscribe(onNext, onError, onComplete);

    scheduler.flush();
    expect(onError).not.toHaveBeenCalled();

    scheduler.advanceTo(199);
    expect(onError).not.toHaveBeenCalled();

    scheduler.advanceTo(200);
    expect(onError).toHaveBeenCalledWith('something went wrong!');

    expect(onNext).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
