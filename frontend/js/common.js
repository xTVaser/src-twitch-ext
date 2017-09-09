/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/*

  Set Javascript common to all extension views in this file.

*/

if(window.Twitch.ext) {

  window.Twitch.ext.onAuthorized(function(auth) {
    console.log(auth);
  });

  window.Twitch.ext.onContext(function(context, contextFields) {
    console.log(context);
    console.log(contextFields);
  });
  
  window.Twitch.ext.onError(function(err) {
    console.error(err);
  });
  
}
