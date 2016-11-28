app.controller('otherController', ['$scope', '$http', '$timeout', '$window', '$filter', function ($scope, $http, $timeout, $window, $filter) {
    angular.isUndefinedOrNullOrEmpty = function (val) {
        return angular.isUndefined(val) || val === null || val === '';
    };

    $scope.$on('$viewContentLoaded', function () {
        //call it here
        $scope.reRender();
    });
    $scope.reRender = function () {
        $('select').material_select();
    }
    $('#ddlDestSpace').on('change', function (e) {
        if ($('#ddlDestSpace').siblings('.dropdown-content').find('li.active>span').text() != "") {
            $scope.getDestLocales($('#ddlDestSpace').siblings('.dropdown-content').find('li.active>span').text());
        }
    });
    $('#ddlAssetLocale').on('change', function (e) {
        if ($('#ddlAssetLocale').siblings('.dropdown-content').find('li.active>span').text() != "") {
            $scope.selectedLocale = ($('#ddlAssetLocale').siblings('.dropdown-content').find('li.active>span').text());
        }
    });
    $('#ddlContentType').on('change', function (e) {
        if ($('#ddlContentType').siblings('.dropdown-content').find('li.active>span').text() != "") {
            $scope.assetContentType = ($('#ddlContentType').siblings('.dropdown-content').find('li.active>span').text());
        }
    });
    $scope.spaces = spac;
    $scope.destLocales = [];
    $scope.assetList = [];

    $scope.getDestLocales = function (destSpaceSelected) {

        $scope.destitem = destSpaceSelected;
        $scope.destitem = $filter('filter')($scope.spaces, {
            space: destSpaceSelected
        })[0];
        $scope.destSpaceId = $scope.destitem.value;
        $scope.destAccessToken = $scope.destitem.token;
        $scope.destClient = contentfulManagement.createClient({
            // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
            accessToken: $scope.destAccessToken
        });

        $scope.destClient.getSpace($scope.destSpaceId)
            .then((space) => {
                // Now that we have a space, we can get locales from that space
                $scope.destSpace = space;
                space.getLocales()
                    .then((locales) => {
                        $scope.destLocales = locales.items;
                        $scope.$apply();
                        $scope.reRender();
                        $scope.findDefaultLocale();
                    })
            });
    }

    $scope.findDefaultLocale = function () {
        var defaultFound = false;
         angular.forEach($scope.destLocales, function (destLocale) {
             if(!defaultFound) {
                   if(destLocale.default == true) {
                       $scope.defaultDestLocale = destLocale.code;
                       defaultFound = true;
                        }
                    }
                });      
    }

    $scope.saveAssetToList = function () {

        if (btnAdd.value == "Update") {
            for (var a in $scope.assetList) {
                if ($scope.assetList[a].assetName == $scope.assetName) {

                    $scope.assetList[a].assetTitle = $scope.assetTitle;
                    $scope.assetList[a].assetContentType = $scope.assetContentType;
                    $scope.assetList[a].assetUrl = $scope.assetUrl;
                    $scope.assetList[a].locale = $scope.selectedLocale;
                    txtAssetName.readOnly = false;
                }
            }
            btnAdd.value = "Add";
        } else if (btnAdd.value == "Add") {
            var currentAsset = {
                assetName: $scope.assetName,
                assetTitle: $scope.assetTitle,
                assetContentType: $scope.assetContentType,
                assetUrl: $scope.assetUrl,
                locale: $scope.selectedLocale
            }
            $scope.assetList.push(currentAsset);
        }

        $scope.assetName = "";
        $scope.assetTitle = "";
        //$scope.assetContentType = ""; //Not working for dropdown
        $scope.assetUrl = "";
        //$scope.selectedLocale = "";  //Not working for dropdown
        Materialize.toast('Congrats! Your operation was successfull', 4000);
    }

    $scope.editAssetInList = function (name, title, contentType, locale, uploadUrl) {

        $scope.assetName = name;
        $scope.assetTitle = title;
        $scope.assetContentType = contentType;
        $scope.assetUrl = uploadUrl;
        $scope.selectedLocale = locale;
        txtAssetName.readOnly = true;
        btnAdd.value = "Update";
    }

    $scope.deleteAssetFromList = function (name) {
        for (var a in $scope.assetList) {
            if ($scope.assetList[a].value == name) {
                $scope.assetList.splice(a, 1);
                //localStorage.setItem('StoredData', JSON.stringify(spac));
                Materialize.toast('Hi, Gone to trash', 4000);
                break;
            }
        }
    }

    $scope.resetData = function () {

        btnAdd.value = "Add";
        $scope.assetName = "";
        $scope.assetTitle = "";
        $scope.assetContentType = ""; //Not working for dropdown
        $scope.assetUrl = "";
        $scope.selectedLocale = ""; //Not working for dropdown
        txtAssetName.readOnly = false;
        Materialize.toast('BOOM ! BOOM !', 4000);
    }


    //Migrate assets from source to Destination

    $scope.createNewAsset = function (selectedAsset) {

        var fileName = selectedAsset.assetName;
        var assetID = selectedAsset.assetName.replace(/\s+/g, '').toLowerCase();
        var title = selectedAsset.assetTitle;
        var contentType = selectedAsset.assetContentType;
        var locale = selectedAsset.locale;
        var uploadPath = selectedAsset.assetUrl;
        //console.log('assetID:' + $scope.assetID + $scope.locale);
        var json = {
            fields: {
                file: {

                },

                title: {

                }
            }
        }

        json.fields.title[locale] = title;
        json.fields.file[locale] = {
            "contentType": contentType,
            "fileName": fileName,
            "upload": "https://" + uploadPath
        }


        $scope.destSpace.createAssetWithId(assetID, json)
            .then((asset) => {
                asset.processForLocale(locale)
                    .then((assetProcessed) => {
                        assetProcessed.publish();
                    }).catch((err) => {
                        console.log(err);
                    });
            }).catch((err) => {
                $scope.destSpace.getAsset(assetID)
                    .then((asset) => {
                        asset.fields.file[locale] = {
                            "contentType": contentType,
                            "fileName": fileName,
                            "upload": "https://" + uploadPath
                        }
                        asset.update()
                            .then((assetUpdated) => {
                                assetUpdated.processForLocale(locale)
                                 .then((assetProcessed) => {
                                     assetProcessed.publish();
                                 }).catch((err) => {
                                     console.log(err);
                                    })
                            }).catch((err) => {
                                console.log(err);
                            })
                    }).catch((err) => {
                        console.log(err);
                    })
            });
    }
    $scope.migratecontent = function () {

            $scope.selectedValues = $scope.assetList;
            //loop for traversing selected items 

            $scope.createAsset = [];
            angular.forEach($scope.selectedValues, function (selectedAsset) {
                    $scope.createNewAsset(selectedAsset);
                }

            ); //end of traversal loop 
        } //end of migrate function


    $scope.uploadToContentful = function () {

        $scope.migratecontent();
    }


}]);