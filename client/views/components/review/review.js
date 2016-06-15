angular.module('savor.review',[
  'ngMaterial',
  'ngMessages',
  'material.svgAssetsCache',
  'ngDialog',
  'ngFileUpload',
  'ngImgCrop',
  'savor.user',
  'wu.masonry'])
.controller('reviewCtrl', function($scope, $http, ngDialog, Upload, $window, Reviews, Meals) {
  angular.extend($scope, Reviews);
  angular.extend($scope, Meals);

  $scope.myImage='';
  $scope.myCroppedImage='';
  $scope.myCroppedImageUrl = '';
  
  // *************** Check to ensure all the appropriate fields are here *****************
  $scope.newReview = function(){
    
    var legibleDate = $scope.meal.date.toDateString();
    var data = ({
      userID: $scope.userOnRootScope.user_id,
      meal: $scope.meal.meal,
      restaurant: $scope.meal.restaurant,
      notes: $scope.meal.notes,
      date: legibleDate,
      image: $scope.myCroppedImageUrl
    });
    $scope.addReview($scope.meals, data);
    $scope.sendPost(data);
    ngDialog.close();
  };
  
  $scope.sendPost = function (data) {
    $http({
      method: "POST",
      data: data,
      url: '/api/users/meals/'
    });
  };


  // attach event listener to file input to detect when a file is loaded
    angular.element(document).ready(function () {
      angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
    });

    // gets triggered when a file has been selected from the file input
    var handleFileSelect = function(evt) {
      var file = evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        console.log('in file reader');
        $scope.$apply(function($scope){
          $scope.myImage = evt.target.result;
        });
      };

      reader.readAsDataURL(file);
    };

    // begins the upload process of the cropped image to AWS
    $scope.upload = function() {
      if($scope.myCroppedImage) {
        // convert cropped image data to a blob
        $scope.uploadBase64ImgToS3($scope.myCroppedImage, guid(), function(err, data) {
          console.log('uploaded', err, data);
        });
      }
      else {
        alert('No File Selected');
      }
    }

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    $scope.uploadBase64ImgToS3 = function(base64Data, filename, callback){
      var xmlhttp = new XMLHttpRequest();    
      var blobData = dataURItoBlob(base64Data);
      blobData.name = filename;
      $scope.getSignedRequest(blobData);
    };

    /*
    The MIT License (MIT)
    Copyright (c) 2016 David Gomez-Urquiza
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */

    function dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var _ia = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }

        var dataView = new DataView(arrayBuffer);
        var blob = new Blob([dataView], { type: mimeString });
        return blob;
    }

    // End of MIT protected function

    $scope.getSignedRequest = function(file){
      console.log(file, 'in signed req');
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
          if(xhr.status === 200){
            var response = JSON.parse(xhr.responseText);
            $scope.uploadFile(file, response.signedRequest, response.url);
          }
          else{
            alert('Could not get signed URL.');
          }
        }
      };
      xhr.send();
    };

    $scope.uploadFile = function(file, signedRequest, url){
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRequest);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
          if(xhr.status === 200){
            $scope.myCroppedImageUrl = url;
            $scope.newReview();
            // $scope.sendPost();
          }
          else{
            alert('Could not upload file.');
          }
        }
      };
      xhr.send(file);
    };
})

.factory('Reviews', function($http){
  var reviews = [];
  var addReview = function(dest,review){
    dest.push(review);
  };
  var removeReview = function(){
    //use signal from button to identify which to delete
  };
  return{
    reviews: reviews,
    addReview: addReview,
    removeReview: removeReview
  };
})

.directive('review', review);
  function review() {
  return {
    templateUrl: '/views/components/review/review.tpl.html',
    controller: reviewCtrl,
    controllerAs: 'review'
  };
}
