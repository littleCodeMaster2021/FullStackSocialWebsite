# cis557-project-photo-sharing-social-network-app-codemasters
cis557-project-photo-sharing-social-network-app-codemasters created by GitHub Classroom

This test is written purely in Java and can be run independent from unit test, since we are more familar with writing Selenium test in Java than written that in Jest. 

## To run this test,please follow the step below:
(1)Download SeleniumTestWrittenInJava package. <br>
(2)Unzip the package.<br>
(3)Undate your chrome brower to the lastest version: Version 78.0.3904.70 in my case.<br>
(4)Edit the configuration for the test as:<br>
![ER Diagram](https://github.com/cis557/cis557-project-photo-sharing-social-network-app-codemasters/blob/selenium_test_written_in_Java/sample%20configuration.png)
Please set the proper work directory to point to the test. <br>
(5)If the compilor informed "the maven projects needed to be imported", then you need to click import changes to import the require libraries. <br>
(6)cd to the master directory, enter node index.js to the terminal to connect the server and run the web at localhost:3000/index.<br>
(7)Change the format of the path from '/' to '\\' if your machine is windows, since '/' is only requested by mac. And Change the web driver path to "/src/test/java/chromedriver.exe" for windows rather than "/src/test/java/chromedriver" for mac. <br>
(8)Run the ProjectTest.java file in any java compilor which is under SeleniumTestWrittenInJava/src/test/java folder.<br> 
(9)If it passes all the tests, it won't return any error, otherwise, it will trigger the assertion failure error alert. <br>

