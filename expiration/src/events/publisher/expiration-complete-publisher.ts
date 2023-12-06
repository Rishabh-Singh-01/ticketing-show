import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@rs-ticketing/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
