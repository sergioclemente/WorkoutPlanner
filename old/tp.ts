class TrainingPeaksWorkout {
    user: string;
    pwd: string;

    constructor(user: string, pwd: string) {
        this.user = user;
        this.pwd = pwd;
    }
    
    stringFormat(str: string, ...args: any[]) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }
    
    createWorkout(date: Date, title: string, distanceInMeters: string, timeInSeconds: number, description:string) {
        var content = this.stringFormat('<?xml version="1.0" encoding="UTF-8"?>\
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\
   <s:Body xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
      <AddWorkoutsForAthlete xmlns="http://www.trainingpeaks.com/TPWebServices/">\
         <username>{0}</username>\
         <password>{1}</password>\
         <workouts>\
            <Workout>\
               <WorkoutId>0</WorkoutId>\
               <WorkoutDay>{2}</WorkoutDay>\
               <PlannedDistanceInMeters>{3}</PlannedDistanceInMeters>\
               <DistanceInMeters xsi:nil="true" />\
               <PowerAverage xsi:nil="true" />\
               <PowerMaximum xsi:nil="true" />\
               <TimeTotalInSeconds xsi:nil="true" />\
               <PlannedTimeTotalInSeconds>{4}</PlannedTimeTotalInSeconds>\
               <VelocityMaximum xsi:nil="true" />\
               <VelocityAverage xsi:nil="true" />\
               <CadenceMaximum xsi:nil="true" />\
               <CadenceAverage xsi:nil="true" />\
               <HeartRateMaximum xsi:nil="true" />\
               <HeartRateMinimum xsi:nil="true" />\
               <HeartRateAverage xsi:nil="true" />\
               <StartTime xsi:nil="true" />\
               <ElevationGain xsi:nil="true" />\
               <ElevationLoss xsi:nil="true" />\
               <ElevationMinimum xsi:nil="true" />\
               <ElevationMaximum xsi:nil="true" />\
               <ElevationAverage xsi:nil="true" />\
               <Description>{5}</Description>\
               <CoachComments>Comment</CoachComments>\
               <Title>{6}</Title>\
               <StartTimePlanned xsi:nil="true" />\
            </Workout>\
         </workouts>\
      </AddWorkoutsForAthlete>\
   </s:Body>\
</s:Envelope>', this.user, this.pwd, "2014-10-08T00:00:00", distanceInMeters, timeInSeconds, title, description);
        
        var headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://www.trainingpeaks.com/TPWebServices/AddWorkoutsForAthlete",
            "ContentType": "application/soap+xml; charset=utf-8",
        };
      
      var httpRequest = new XMLHttpRequest();
        httpRequest.open("POST","http://www.trainingpeaks.com/tpwebservices/service.asmx", false);

        for (var key in headers) {
            httpRequest.setRequestHeader(key, headers[key]);
        }
        
        httpRequest.send(content);      
        
        return httpRequest.status == 200;
    }   
};