﻿main();

//BoardsScrape, by Adam Keefe
//written December 2019, updated August 2020
//this is a new take on the project pages scrape code. it has been tailored to search for data based on locations rather than master stories
//safety nets have been added including margin functions, master spread checks, and layout detection
//updated August 2020 with working variables for newly formatted spreads from Q2 2020.
//other notes: code has been added to drastically simplify the aggregation steps, and an exportLinks function has been written to pull and associate all images 

//basic declaration of interaction levels to override link/font warnings to ease batch run
function main(){
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    //app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
    if(app.documents.length != 0){
		if (app.activeDocument.stories.length != 0){
              myFolder = ("U:/")
              expFormat = ".txt"
              myExportPages(expFormat, myFolder)
              $.gc()
              }
          else alert("The document does not contain any text. Please open a document containing text and try again.");
          }
      else alert("No documents are open. Please open a document and try again.");
}

function myExportPages(myExportFormat, myFolder){
    var curDate = new Date();
    myFileName = "ak.DataMine_" + curDate.toDateString()+ myExportFormat;
    myFilePath = myFolder + "/" + myFileName;    
    var myFile = new File(myFilePath);
    app.scriptPreferences.measurementUnit = MeasurementUnits.INCHES;
    
//resolves the lack of indexOf function   
if (typeof Array.prototype.indexOf != "function") {  
    Array.prototype.indexOf = function (el) {  
        for(var i = 0; i < this.length; i++) if(el === this[i]) return i;  
        return -1;  
        }  
}                  
    //var basicMasters = ["A-Master","B.1-Project Team (Headshots)","B.2-Project Team (Group Photo)","B.3-Project Details","C.1-P
    
    //file information 
    var fileArr = ["\"" + "\"","\"" + "\"","\"" + "\""];
    
    //creates null array of projects on the page, to be either modified or added to with pageRow
    var storyIndex = [[]];
    storyIndex.pop();
    
   
    
    //load file info array into project index of filepath, modify date
    fileArr[0] = csvQuotes(app.activeDocument.fullName.toString().replace("/m/","//d-peapcny.net/enterprise/M_Marketing/"));
    fileArr[1] = csvQuotes(File(app.activeDocument.fullName).modified);
    fileArr[2] = csvQuotes(File(app.activeDocument.fullName).parent.name);
    
    
    //fill row with null values at first
    var pageRow = [];
    for(pR = 0; pR < 8 ; pR++) pageRow[pR] = ("\"" + "\"");
    //input filepath into pageRow
    
    var templateBoxes = [{name: "Employee Name", x : 3.2917, y: 1.1522, val: ""},
    {name: "Title", x: 3.2917, y: 2.5662, val: ""},
    {name: "Biography", x: 3.2917, y: 3.25, val: ""},
    {name: "Education", x: 1.125, y: 3.25, val: ""},
    {name: "Registration", x: 1.125, y: 3.25, val: ""},
    {name: "Memberships", x: 1.125, y: 3.25, val: ""},
    {name: "Awards", x: 1.125, y: 3.25, val: ""},
    {name: "Publications", x: 1.125, y: 3.25, val: ""},
    {name: "Project Entry", x: 10.0119, y: 2.2883, val: ""}];
  
    //iterating through spreads of document (spreads are designated instead of pages to accommodate spreads of multiple sheets with common information)
   
   for(myCounter = 0; myCounter < app.activeDocument.pages.length; myCounter++){
        //get current page
        //alert("number of pages in document is " + app.activeDocument.pages.length);
        //alert("Current page is " + myCounter);
        myPage = app.activeDocument.pages.item(myCounter);
        
        pageRow = [];
        for(pR = 0; pR < 8 ; pR++) pageRow[pR] = ("\"" + "\"");
        
         //ungroups any layers within the document, if there are any.                  
         for(s=0;s<myPage.groups.length;s++){
                checkGroup = myPage.groups.item(s);
                checkGroup.ungroup(); 
            }
        var projectFactoids = [];
        
     for (h = 0;h <templateBoxes.length;h++){
         for (j = 0;j <myPage.textFrames.length;j++){
             myPosition = myPage.textFrames[j].geometricBounds;
             if (approx(myPosition[0],templateBoxes[h].y) && approx(myPosition[1],templateBoxes[h].x) && templateBoxes[h].val == ""){
                 myStory = myPage.textFrames[j].parentStory;
                 //alert("current story is: " + myStory.contents);
                 if (templateBoxes[h].name =="Employee Name") templateBoxes[h].val = myStory.contents;
                 if (templateBoxes[h].name =="Title") templateBoxes[h].val = myStory.contents;
                 if (templateBoxes[h].name =="Biography") templateBoxes[h].val = myStory.contents;
                 if ( h > 2 && h < 8 && myStory.contents.indexOf(templateBoxes[h].name) !== -1)  templateBoxes[h].val = myStory.contents.split(templateBoxes[h].name,2)[1].split(templateBoxes[h+1].name,1)[0].split(templateBoxes[h+2].name,1)[0];
                 //alert(templateBoxes[h].val);
                 }
         }
     }
 
    //if (myPage.textFrames[j].parentStory.appliedParagraphStyle.name == "Resume Project Name";
        
     
     for (z = 0; z <pageRow.length;z++)pageRow[z] = csvQuotes(csvFriendly(templateBoxes[z].val));
     if (pageRow[0] !== "\""+ "\"" && pageRow[0] !== "") writeDataAndLinks(fileArr,pageRow,myFile);
    //var referenceArray = myPage.textFrames[j].parentStory.Paragraphs
      //need to figure out how to pull just the story which has all the projects
    projectFactoids = [];
                    
    for (h = 0;h <myPage.textFrames.length;h++){
        if (myPage.textFrames[h].parentStory.isValid && myPage.textFrames[h].parentStory.paragraphs.firstItem().isValid && storyIndex.indexOf(myPage.textFrames[h].parentStory.id) == -1){
        myStory = myPage.textFrames[h].parentStory;
        storyIndex.push(myStory.id);
        if (myStory.paragraphs.firstItem().appliedParagraphStyle.name == "Resume Practice Area" || myStory.paragraphs.firstItem().appliedParagraphStyle.name == "Resume Project Name"){
            for (a = 0; a <myStory.paragraphs.length;a++){
                if (myStory.paragraphs[a].appliedParagraphStyle.name =="Resume Project Name"){
                    writeDataAndLinks(fileArr,pageRow + projectFactoids,myFile);
                    //alert(projectFactoids);
                    projectFactoids = [];
                    projectFactoids[0] = csvFriendly(myStory.paragraphs[a].contents).replace("</p><p>","");
                    }
                if (myStory.paragraphs[a].appliedParagraphStyle.name =="Resume Project Location") projectFactoids[1] = csvFriendly(myStory.paragraphs[a].contents).replace("</p><p>","");
                if (myStory.paragraphs[a].appliedParagraphStyle.name =="Body Text" || myStory.paragraphs[a].appliedParagraphStyle.name =="Body Text with Bullets" ){
                    if (projectFactoids[2] !== undefined) projectFactoids[2] = projectFactoids[2] + ";" + csvFriendly(myStory.paragraphs[a].contents).replace("</p><p>","");
                    else projectFactoids[2] = csvFriendly(myStory.paragraphs[a].contents).replace("</p><p>","");
                    }
                }
            writeDataAndLinks(fileArr,pageRow + projectFactoids,myFile);
            }
        }
        }
         //alert(pageRow);
        
   
    //alert("length of project index " + projIndex.length);
    for (e=0;e<templateBoxes.length;e++) templateBoxes[e].val = "";

}

}

function writeDataAndLinks(fileArr,pR,myFile){
        //alert(pR);
        myPageText = fileArr.toString() +"\," + pR.toString() + "\n";        
        //alert("adding to export: "+ pR);
        writeFile(myFile,myPageText,"UTF-8");
        }
    
function exportLinks(dT,dN,getLinks){
   for (l = 0; l < getLinks.length; l++){
        var eachLink = new Link();
        eachLink = getLinks[l];
        savePath = "//d-peapcny.net/enterprise/G_Gen-Admin/Committees/Design-Communication/Design On The Boards/2020/ExportedLinks/"+dT+"_"+dN;
        var myFolder = new Folder(savePath);
        myFolder.create();
        //alert("copying file from "+ eachLink.filePath);
        eachLink.copyLink(savePath,"",false);
        }
  return getLinks;
  }
    
//sets encoding properties and writing components
function writeFile(fileObj, fileContent, encoding) {
    //var csvContent = 'data:text/csv;charset=utf-8,%EF%BB%BF'
    encoding = encoding || "UTF-8";
    var titleRow = [csvQuotes("FilePath"),csvQuotes("Title"),csvQuotes("Biography"),
                            csvQuotes("Employee Name"),csvQuotes("Title"),csvQuotes("Biography"),
                            csvQuotes("Education"),csvQuotes("Registration"),csvQuotes("Memberships"),
                            csvQuotes("Awards"),csvQuotes("Publications"),csvQuotes("Project Name"),
                            csvQuotes("Project Location"),csvQuotes("Project Summary")]
                       
    if (!fileObj.exists) fileContent2 = titleRow.toString() + "\n" + fileContent;
    else fileContent2 = fileContent;
         
    fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj);  
  
    var parentFolder = fileObj.parent;
    if (!parentFolder.exists && !parentFolder.create())  
        throw new Error("Cannot create file in path " + fileObj.fsName);  
        
    fileObj.encoding = encoding;  
    fileObj.open("a");  
    fileObj.write(fileContent2);  
    fileObj.close();
    
    return fileObj;  
}  

//function copyLinks(

//convert text into compatible csv format--REPLACE </P><P> WITH PARAGRAPH BREAK FOR HTML FORMATTING AND #% WITH COMMA
 
 //creates function to compare numbers to see if two are approximately the same
function approx(number,reference,delta){
    var delta = .02;
    if (Math.abs((number - reference)) <= delta || Math.abs((reference - number)) <= delta) return true
    else return false
    }

//3 functions to rework text into quotes/HTML format for the purposes of being loaded into a workable CSV
function csvQuotes(myText){
    myText = ("\"" + myTrim(myText) + "\"");
    return myText
}

function csvFriendly(myText){
    myText =  myTrim(myText.toString().replace(/(\r\n|\n|\r)/gm,"</p><p>").replace(/,/g,"#%"));
    return myText;
 }
 
function myTrim(str) {
    return str.toString().replace(/^\s\s*/, "").replace(/\s\s*$/, "").replace(/(^\s*(?!.+)\r+)|(\r+\s+(?!.+)$)/g, "");
}

//logging function used for debugging purposes
function logMe(input){
     var now = new Date();
     var output = now.toTimeString() + ": " + input;
     $.writeln(output);
     var logFile = File("/path/to/logfile.txt");
     logFile.open("e");
     logFile.writeln(output);
     logFile.close();
}
