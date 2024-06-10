/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
 define(['N/search','N/error','N/record'], function(search,error,record){
 
	function searchAllRecord(recordType,searchId,searchFilter,searchColumns)
	{		
		try 
		{	
			var arrSearchResults =[];
			var count = 1000,min = 0,max = 1000;
			var searchObj = false;
			if(recordType==null)
			{
				recordType=null;
			}
			if (searchId) 
			{
				searchObj = search.load({id : searchId});
				if (searchFilter)
				{
					searchObj.addFilters(searchFilter);
				}
				if (searchColumns)
				{
					searchObj.addColumns(searchColumns);
				}           
			}
			else
			{
				searchObj = search.create({type:recordType,filters:searchFilter,columns:searchColumns})
			}
			
			var rs = searchObj.run();			
			
		
			while (count == 1000) 
			{
				var resultSet = rs.getRange({start : min,end :max});											
				if(resultSet!=null)
				{
					arrSearchResults = arrSearchResults.concat(resultSet);
					min = max;
					max += 1000;
					count = resultSet.length;
				}
			}
		} 
		catch (e) 
		{
			log.debug( 'Error searching for Customer:- ', e.message);
		}
		return arrSearchResults;
	}
	
	

function pushSearchResultIntoArray(searchResultSet)
	{
		var arrayList = new Array();
		for(var iterate in searchResultSet)
		{
			var resultObj = {};
			var cols = searchResultSet[0].columns;
			resultObj['type'] = searchResultSet[iterate].recordType;
			for(var coliterate in cols)
			{
				var prop;
				if(cols[coliterate].label)
				prop = cols[coliterate].label;
				else
				prop = cols[coliterate].name;
				
				resultObj[prop]= searchResultSet[iterate].getValue({name:cols[coliterate]});
			}
			arrayList.push(resultObj);
		}
		return arrayList;
	}
	

 
 return{
 searchAllRecord:searchAllRecord,
 pushSearchResultIntoArray:pushSearchResultIntoArray
 };
 })