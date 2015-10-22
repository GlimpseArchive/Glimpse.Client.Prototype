'use strict';

var $ = require('$jquery');

var payload = {  
   "sql":{  
      "data":{  
         "queryCount":3,
         "connectionCount":3,
         "transactionCount":0,
         "queryExecutionTime":40.34,
         "connectionOpenTime":42.17
      },
      "name":"sql"
   },
   "timings":{  
      "data":[  
         {  
            "title":"Controller: Home.Index",
            "startTime":"10/22/2015 01:32:40",
            "duration":8.48,
            "startPoint":9.61,
            "category":"Controller"
         },
         {  
            "title":"Command: Executed",
            "startTime":"10/22/2015 01:32:40",
            "duration":3.29,
            "startPoint":12.8,
            "category":"Command"
         },
         {  
            "title":"Render: Home.Index",
            "startTime":"10/22/2015 01:32:40",
            "duration":122.75,
            "startPoint":36.98,
            "category":"View"
         },
         {  
            "title":"Controller: ShoppingCart.CartSummary",
            "startTime":"10/22/2015 01:32:40",
            "duration":37.67,
            "startPoint":48.52,
            "category":"Controller"
         },
         {  
            "title":"Command: Executed",
            "startTime":"10/22/2015 01:32:40",
            "duration":34.32,
            "startPoint":51.73,
            "category":"Command"
         },
         {  
            "title":"Render: ShoppingCart.CartSummary",
            "startTime":"10/22/2015 01:32:40",
            "duration":0.26,
            "startPoint":105.14,
            "category":"View"
         },
         {  
            "title":"Controller: Store.GenreMenu",
            "startTime":"10/22/2015 01:32:41",
            "duration":6.6,
            "startPoint":121.44,
            "category":"Controller"
         },
         {  
            "title":"Command: Executed",
            "startTime":"10/22/2015 01:32:40",
            "duration":2.73,
            "startPoint":125.06,
            "category":"Command"
         },
         {  
            "title":"Render: Store.GenreMenu",
            "startTime":"10/22/2015 01:32:41",
            "duration":0.9,
            "startPoint":147.15,
            "category":"View"
         }
      ],
      "name":"Timings"
   },
   "environment":{  
      "data":{  
         "serverName":"RD000D3A338496",
         "user":"",
         "serverTime":"10/22/2015 01:32:41",
         "serverTimezoneOffset":"+0000",
         "serverDaylightSavingTime":false
      },
      "name":"environment"
   },
   "mvc":{  
      "data":{  
         "controllerName":"Home",
         "actionName":"Index",
         "actionExecutionTime":8.48,
         "childActionCount":2,
         "childViewCount":2,
         "viewName":"Index",
         "viewRenderTime":122.75,
         "matchedRouteName":"Default"
      },
      "name":"mvc"
   }
};
 

$.getJSON = function(url, callback) {
	// TODO: turn into a strategy latere on if needed
	if (url == '/glimpse/message-history') {
		setTimeout(function() {
			// TODO: need to pass actual data back here, just getting things going end to end
			callback(payload);
		}, 1000);
		
	}
}