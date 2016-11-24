app.controller('otherController', ['$scope', '$http', '$timeout', '$window', '$filter', function ($scope, $http, $timeout, $window, $filter) {
    angular.isUndefinedOrNullOrEmpty = function (val) {
        return angular.isUndefined(val) || val === null || val === '';
    };

    $scope.$on('$viewContentLoaded', function () {
        //call it here
        $('select').material_select();
    });
    $('#ddlDestSpace').on('change', function (e) {
        if ($('#ddlDestSpace').siblings('.dropdown-content').find('li.active>span').text() != "") {
            $scope.getDestAssets($('#ddlDestSpace').siblings('.dropdown-content').find('li.active>span').text());
        }
    });
    $scope.assetList = [];

    $scope.saveAssetToList = function () {

        if (btnAdd.value == "Update") {
            for (var a in $scope.assetList) {
                if ($scope.assetList[a].assetName == $scope.assetName) {
                    $scope.assetList[a].assetTitle = $scope.assetTitle;
                    $scope.assetList[a].assetContentType = $scope.assetContentType;
                    $scope.assetList[a].assetUrl = $scope.assetUrl;
                    txtAssetName.readOnly = false;
                }
            }
            btnAdd.value = "Add";
        } else if (btnAdd.value == "Add") {
            var currentAsset = {
                assetName: $scope.assetName,
                assetTitle: $scope.assetTitle,
                assetContentType: $scope.assetContentType,
                assetUrl: $scope.assetUrl
            }
            $scope.assetList.push(currentAsset);
        }

        $scope.assetName = "";
        $scope.assetTitle = "";
        $scope.assetContentType = "";
        $scope.assetUrl = "";
        Materialize.toast('Congrats! Your operation was successfull', 4000);
    }

    $scope.editAssetInList = function (name, title, contentType, uploadUrl) {

        $scope.assetName = name;
        $scope.assetTitle = title;
        $scope.assetContentType = contentType;
        $scope.assetUrl = uploadUrl;
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

        btnAdd.value = "Save";
        $scope.assetName = "";
        $scope.assetTitle = "";
        $scope.assetContentType = "";
        $scope.assetUrl = "";
        txtAssetName.readOnly = false;
        Materialize.toast('BOOM ! BOOM !', 4000);
    }
}]);