import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';

export type Data = {
  action: 'update_password' | 'forgot_password';
};

export type Password = {
  password: {
    action: string;
  };
};

function password(data: Data): Password {
  return composeEventData(Events.Password)(
    namespace('password')(property('action', data.action, true)),
  ) as Password;
}

export default password;
