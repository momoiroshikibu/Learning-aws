import {Config, CognitoIdentityCredentials, S3, WebIdentityCredentials} from 'aws-sdk';
import {CognitoUserPool} from 'amazon-cognito-identity-js';
import Credentials from './Credentials';
import AwsConfig from './AwsConfig.js'

const COGNITO_USER_POOL = new CognitoUserPool({
    UserPoolId: AwsConfig.USER_POOL_ID,
    ClientId: AwsConfig.CLIENT_ID
});

const IDENTITY_POOL_ID = AwsConfig.IDENTITY_POOL_ID;

AWS.config.region = AwsConfig.REGION;
AWS.config.credentials = new CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
    get: function(err, success){
        console.log('get');
        console.error(err);
        console.log(success);
    }
});


document.getElementById('login_button').onclick = (event) => {

    const credentials = new Credentials(COGNITO_USER_POOL,
                                        document.getElementById('userName').value,
                                        document.getElementById('password').value);

    credentials.authenticate({
        onSuccess: (credentials, result) => {
            const user = credentials.userPool.getCurrentUser();
            AWS.config.credentials = new CognitoIdentityCredentials({
                IdentityPoolId: IDENTITY_POOL_ID,
                Logins: {
                    'cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_lZQwFdsiy': result.getIdToken().getJwtToken()
                },
            });
            s3();
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


function s3() {
    var s3 = new S3({
        params: {
            Bucket: AwsConfig.BUCKET_NAME,
            Region: AwsConfig.REGION
        }
    });

    s3.listObjects(function(error, response) {
        console.log(response.Contents);

        response.Contents.forEach((content) => {
            const downloadUrl = s3.getSignedUrl('getObject', {
                Bucket: AwsConfig.BUCKET_NAME,
                Key: content.Key,
                Expires: 60 * 5 // 5 minutes
            });
            console.log(downloadUrl);
        })
    });
}

