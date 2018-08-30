define(['add'], function (add) {

  var decrease = function (x, y) {

    return add.add(x, y) - y;

  };

  return {
    decrease
  };

});