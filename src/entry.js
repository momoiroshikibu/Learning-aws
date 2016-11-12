import {Config, CognitoIdentityCredentials} from 'aws-sdk';
import {CognitoUserPool} from 'amazon-cognito-identity-js';
import Credentials from './Credentials';
import AwsConfig from './AwsConfig.js'

const COGNITO_USER_POOL = new CognitoUserPool({
    UserPoolId: AwsConfig.USER_POOL_ID,
    ClientId: AwsConfig.CLIENT_ID
});

const IDENTITY_POOL_ID = AwsConfig.IDENTITY_POOL_ID;

Config.region = AwsConfig.REGION;
Config.credentials = new CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID
});


document.getElementById('login_button').onclick = (event) => {

    const credentials = new Credentials(COGNITO_USER_POOL,
                                        document.getElementById('userName').value,
                                        document.getElementById('password').value);
    credentials.authenticate({
        onSuccess: (credentials, result) => {
            console.log(this);
            console.log(result.getAccessToken().getJwtToken());
        },
        onFailure: (credentials, error) => {
            alert(error);
        },
        newPasswordRequired: (credentials, userAttributes, requiredAttributes) => {
            const newPassword = window.prompt('Enter new password (sorry for showing letters...)');
            credentials.getCognitoUser().completeNewPasswordChallenge(newPassword, null, this);
        }
    });
};
