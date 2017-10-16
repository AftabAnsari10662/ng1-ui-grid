
//Adding ui grid module as a depedency in app
var app = angular.module('app', ['ui.grid', 'ui.bootstrap']);

// var app = angular.module('app', ['ui.grid']);

//Controller function to load the data
app.controller('MainCtrl', function ($scope, $http, CustomerService) {

    //function to be called on row edit button click
    //Passing the selected row object as parameter, we use this row object to identify  the edited row
    $scope.edit = function (row) {
        //Get the index of selected row from row object
        var index = $scope.gridOptions.data.indexOf(row);
        //Use that to set the editrow attrbute value for seleted rows
        $scope.gridOptions.data[index].editrow = !$scope.gridOptions.data[index].editrow;
        $scope.gridOptions.data[index].workflows = $scope.workflows;
    };

    //Method to cancel the edit mode in UIGrid
    $scope.cancelEdit = function (row) {
        //Get the index of selected row from row object
        var index = $scope.gridOptions.data.indexOf(row);
        //Use that to set the editrow attrbute value to false
        $scope.gridOptions.data[index].editrow = false;
        //Display Successfull message after save
        $scope.alerts.push({
            msg: 'Row editing cancelled',
            type: 'info'
        });
    };

    $scope.alerts = [];

    //Class to hold the customer data
    $scope.Customer = {
        customerID: '',
        companyName: '',
        contactName: '',
        contactTitle: ''
    };

    //Function to save the data
    //Here we pass the row object as parmater, we use this row object to identify  the edited row
    $scope.saveRow = function (row) {
        //get the index of selected row 
        var index = $scope.gridOptions.data.indexOf(row);
        //Remove the edit mode when user click on Save button
        $scope.gridOptions.data[index].editrow = false;

        //Assign the updated value to Customer object
        $scope.Customer.customerID = row.CustomerID;
        $scope.Customer.companyName = row.CompanyName;
        $scope.Customer.contactName = row.ContactName;
        $scope.Customer.contactTitle = row.ContactTitle;

        //Call the function to save the data to database
        CustomerService.SaveCustomer($scope).then(function (d) {
            //Display Successfull message after save
            $scope.alerts.push({
                msg: 'Data saved successfully',
                type: 'success'
            });
        }, function (d) {
            //Display Error message if any error occurs
            $scope.alerts.push({
                msg: d.data,
                type: 'danger'
            });
        });
    };
    //Get function to populate the UI-Grid
    $scope.GetWorkflowAssignment = function () {
        $scope.gridOptions = {
            // enableFiltering: true,
            // paginationPageSizes: [10, 20, 30],
            // paginationPageSize: 10,
            //Declaring column and its related properties
            columnDefs: [
                {
                    name: "exceptionDefinitionName",
                    displayName: "Exception Definition ",
                    field: "exceptionDefinitionName",
                    width: 250
                },
                {
                    name: "workflowDefinitionName",
                    displayName: "Workflow Definition",
                    field: "workflowDefinitionName",
                    cellTemplate: '<div  ng-if="!row.entity.editrow">{{COL_FIELD}}</div><div ng-if="row.entity.editrow"><select style="height:30px" ng-options="workflow.name as workflow.name for workflow in row.entity.workflows" ng-model="MODEL_COL_FIELD"></select></div>',
                    width: 200
                },
                {
                    name: 'Actions',
                    field: 'edit',
                    enableFiltering: false,
                    enableSorting: false,
                    cellTemplate: '<div><button ng-show="!row.entity.editrow" class="btn primary" ng-click="grid.appScope.edit(row.entity)"><i class="fa fa-edit"></i></button>' +  //Edit Button
                    '<button ng-show="row.entity.editrow" class="btn primary" ng-click="grid.appScope.saveRow(row.entity)"><i class="fa fa-floppy-o"></i></button>' +//Save Button
                    '<button ng-show="row.entity.editrow" class="btn primary" ng-click="grid.appScope.cancelEdit(row.entity)"><i class="fa fa-times"></i></button>' + //Cancel Button
                    '</div>', width: 100
                }
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            }
        };
        //Function load the data from database
        CustomerService.GetWorkflowAssignment().then(function (d) {
            $scope.gridOptions.data = d.data;
        }, function (d) {
            alert(d.data);
        });

        CustomerService.GetWorkflow().then(function (d) {
            $scope.workflows = d.data;
        }, function (d) {
            alert(d.data);
        });

    };
    //Call  function to load the data
    $scope.GetWorkflowAssignment();
});

//Factory
app.factory('CustomerService', function ($http) {
    var res = {};
    res.GetWorkflowAssignment = function () {
        return $http({
            method: 'GET',
            dataType: 'application/json',
            url: 'wfassign.json'
        });
    }

    res.GetWorkflow = function () {
        return $http({
            method: 'GET',
            dataType: 'application/json',
            url: 'workflow.json'
        });
    }

    res.SaveCustomer = function ($scope) {
        return $http({
            method: 'POST',
            data: $scope.Customer,
            url: 'api/Customer/UpdateCustomer'
        });
    }
    return res;
});