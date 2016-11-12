import {AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';

class Credentials {

    constructor(userPool, userName, password) {
        this.userPool = userPool;
        this.userName = userName;
        this.password = password;
        this.cognitoUser = new CognitoUser({
            Username: userName,
            Pool: userPool
        });
        this.authenticationDetails = new AuthenticationDetails({
            Username: userName,
            Password: password
        });
    }

    authenticate(callbacks) {
        this.cognitoUser.authenticateUser(this.authenticationDetails, {
            onSuccess: (result) => {
                callbacks.onSuccess && callbacks.onSuccess(this, result);
            },
            onFailure: (error) => {
                callbacks.onFailure && callbacks.onFailure(this, error);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                callbacks.newPasswordRequired && callbacks.newPasswordRequired(this, userAttributes, requiredAttributes);
            }
        });
    }
}

export default Credentials;
