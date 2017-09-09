/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/*

  Set Javascript specific to the extension configuration view in this file.

*/

var objectData =
         {
             string1: "test123",
             string2: "yes"
         };

var objectDataString = JSON.stringify(objectData);

$("#saveBtn").click(function(){
    console.log("clicked")
    $.ajax({
        type: "POST",
        url: "http://69ded638.ngrok.io/save",
        dataType: "json",
        data: {
            o: objectDataString
        },
        success: function (res) {
           alert('Success\nResponse Code:' + res.status + '\nMessage: ' + res.success);

        },
        error: function () {
            alert('Error');
        }
    });
});
