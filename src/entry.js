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

    document.getElementById('links').innerHTML = 'loading...';

    const credentials = new Credentials(COGNITO_USER_POOL,
                                        document.getElementById('userName').value,
                                        document.getElementById('password').value);

    credentials.authenticate({
        onSuccess: (credentials, result) => {

            const s3 = newS3(AwsConfig.REGION,
                             AwsConfig.USER_POOL_ID,
                             IDENTITY_POOL_ID,
                             result.getIdToken().getJwtToken());
            fetchS3Objects(s3, (response) => {
                document.getElementById('login_wrapper').innerHTML = '';
                showObjectDownloadLinks(s3, response.Contents);
            });
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


function newS3(region, userPoolId, identityPoolId, jwtToken) {
    const params = {
        IdentityPoolId: identityPoolId,
        Logins: {}
    };
    params.Logins[`cognito-idp.${region}.amazonaws.com/${userPoolId}`] = jwtToken;
    AWS.config.credentials = new CognitoIdentityCredentials(params);

    return new S3({
        params: {
            Bucket: AwsConfig.BUCKET_NAME,
            Region: AwsConfig.REGION
        }
    });
}

function fetchS3Objects(s3, callback) {
    s3.listObjects(function(error, response) {
        callback && callback(response)
    });
}

function showObjectDownloadLinks(s3, contents) {
    const links = contents.map((content) => {
        const downloadUrl = s3.getSignedUrl('getObject', {
            Bucket: AwsConfig.BUCKET_NAME,
            Key: content.Key,
            Expires: 60 * 5 // 5 minutes
        });
        return `<li><a href="${downloadUrl}">${content.Key}</a></li>`;
    });
    document.getElementById('links').innerHTML = links.join('');
}

