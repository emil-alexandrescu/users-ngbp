angular.module('avatar', [])
    .directive('avatarupload', function() {
        return {
            restrict: 'E',
            scope:false,
            templateUrl: 'avatar/avatarupload.tpl.html',
            link: function(scope, element, attr){
                $(element).find('.fileinput').on('change.bs.fileinput', function(){
                    var User = Parse.Object.extend("User");
                    var currentuser = Parse.User.current();
                    var fileUploadControl = $(this).find("input[type='file']")[0];
                    if (fileUploadControl.files.length > 0) {
                        var file = fileUploadControl.files[0];
                        var name = $(element).find('.fileinput-filename').html();
                        var parseFile = new Parse.File(name, file);
                        parseFile.save().then(function() {
                            currentuser.set("avatar", parseFile);
                            currentuser.save();
                            scope.avatarurl = parseFile.url();
                            scope.$digest();
                        }, function(error) {
                            console.log(error);
                        });
                    }
                })
            }
        };
    })
    .directive('avatar', function(){
        return {
            restrict: 'E',
            scope:false,
            templateUrl: 'avatar/avatar.tpl.html',
            link: function(scope, element, attr){
                var User = Parse.Object.extend("User");
                var currentuser = Parse.User.current();
                try{
                    scope.avatarurl = currentuser.get("avatar").url();
                }catch(e){
                    scope.avatarurl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjcwIiB5PSI3MCIgc3R5bGU9ImZpbGw6I2FhYTtmb250LXdlaWdodDpib2xkO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OkFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmO2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPjE0MHgxNDA8L3RleHQ+PC9zdmc+";
                }
            }
        }
    })


