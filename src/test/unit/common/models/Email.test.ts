import {Email} from 'common/models/Email';
import {GenericForm} from 'common/form/models/genericForm';

describe('Email model', () => {
  it('should construct with an email address', () => {
    const email = new Email('user@example.com');
    expect(email.emailAddress).toBe('user@example.com');
  });

  it('should construct with undefined email address', () => {
    const email = new Email();
    expect(email.emailAddress).toBeUndefined();
  });

  it('should not validate when email address is empty', async () => {
    const form = new GenericForm(new Email());
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should reject an invalid email address', async () => {
    const form = new GenericForm(new Email('not-an-email'));
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('emailAddress')).toBe('ERRORS.ENTER_VALID_EMAIL');
  });

  it('should accept a valid email address', async () => {
    const form = new GenericForm(new Email('valid@example.com'));
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });
});
