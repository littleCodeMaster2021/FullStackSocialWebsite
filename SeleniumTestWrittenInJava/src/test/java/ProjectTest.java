import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

public class ProjectTest {
    /**
     * Check internet connection!
     * @return true if it can connect localhost:3000
     */
    private static boolean netIsAvailable() {
        try {
            final URL url = new URL("http://localhost:3000/index");
            final URLConnection conn = url.openConnection();
            conn.connect();
            conn.getInputStream().close();
            return true;
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            return false;
        }
    }

    public static void main (String[] args) throws InterruptedException {
        if (netIsAvailable()) {
            //set webdriver location at mac
            //If you have a windows, please change the directory path using "\" not "/"
            //Please update and make sure the Chrome browser you using is Version 78.0.3904.70

            String projectPath = System.getProperty(("user.dir"));
            System.setProperty("webdriver.chrome.driver", projectPath + "/src/test/java/chromedriver");
            WebDriver driver = new ChromeDriver();
            driver.get("http://localhost:3000/index");
            Thread.sleep(2000);
            driver.manage().window().maximize();
            //Input register information
            driver.findElement(By.id("register")).click();
            Thread.sleep(2000);
            driver.findElement(By.id("name")).sendKeys("user name1");
            driver.findElement(By.id("email")).sendKeys("user_email_new1@gmail.com");
            driver.findElement(By.id("pass")).sendKeys("123456abcd!");
            driver.findElement(By.id("rePass")).sendKeys("123456abcd!");
            driver.findElement(By.id("agreeTerm")).click();
            driver.findElement(By.id("register")).click();
            Thread.sleep(2000);
            //Try to login
            driver.findElement(By.id("userName")).sendKeys("user_email_new1@gmail.com");
            driver.findElement(By.id("password")).sendKeys(("123456abcd!"));
            driver.findElement(By.id("submit")).click();
            Thread.sleep(2000);
            //Verify the user email
            Assert.assertEquals(driver.findElement(By.id("userEmail")).getText(), "user_email_new1@gmail.com");

            driver.findElement(By.xpath("//a[@href='/updateProfile?user_email_new1@gmail.com']")).click();
            Thread.sleep(2000);
            driver.switchTo().defaultContent();
            Thread.sleep(3000);

//        WebDriverWait wait = new WebDriverWait(driver, 2000);
//        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("clear")));
//        driver.findElement(By.id("clear")).click();
            //Before enter more user infor, clear all the field first
            JavascriptExecutor jse = (JavascriptExecutor) driver;
            jse.executeScript("arguments[0].click();", driver.findElement(By.id("clear")));
            //Check whether all the fields have been cleaned
            Assert.assertEquals(driver.findElement(By.id("Name")).getText(), "");
            Assert.assertEquals(driver.findElement(By.id("DateOfBirth")).getText(), "");
            Assert.assertEquals(driver.findElement(By.id("Email Address")).getText(), "");
            //Input more user information
            driver.findElement(By.id("Name")).sendKeys("User Name");
            driver.findElement(By.id("DateOfBirth")).sendKeys("01/01/1990");
            driver.findElement(By.xpath("//label[contains(.,'Female')]/input")).click();
            new Select(driver.findElement(By.id("Country"))).selectByValue("United States");
            driver.findElement(By.id("overview")).sendKeys("I am a graduate student from UPenn.");
            //Submit the form
            jse.executeScript("arguments[0].click();", driver.findElement(By.id("submit")));

            Thread.sleep(2000);
            driver.switchTo().defaultContent();
            //go to the user profile page to check all the data fetching from database at backend
            Assert.assertEquals(driver.findElement(By.id("checkName")).getText(),"User Name");
            Assert.assertEquals(driver.findElement(By.id("DateOfBirth")).getText(),"1990-01-01");
            Assert.assertEquals(driver.findElement(By.id("Gender")).getText(),"Female");
            Assert.assertEquals(driver.findElement(By.id("country")).getText(),"United States");
            Assert.assertEquals(driver.findElement(By.id("overview")).getText(),"I am a graduate student from UPenn.");
            Assert.assertEquals(driver.findElement(By.className("userName")).getText(),"User Name");
            Assert.assertEquals(driver.findElement(By.id("userEmail")).getText(),"user_email_new1@gmail.com");
            Thread.sleep(2000);
            //Go to the user infor page again
            driver.findElement(By.xpath("//a[@href='/profile?user_email_new1@gmail.com']")).click();
            Thread.sleep(2000);
            //check follower
            driver.findElement(By.id("follow")).click();
            driver.findElement(By.id("showContacts")).click();
            Thread.sleep(2000);
            //Assert.assertNotNull(driver.findElement(By.xpath("//a[@href='/otherprofilePost?user_email_new1@gmail.com?abc@gmail.com']")).getText());
            driver.findElement(By.xpath("//a[@href='/getActiveFeed?user_email_new1@gmail.com']")).click();
            Thread.sleep(2000);
            driver.findElement(By.xpath("//div[@class='pull-right btn-group-xs buttonGroup']/button[1]")).click();
            Assert.assertNotNull(driver.findElement(By.xpath("//div[@class='pull-right btn-group-xs buttonGroup']/button[1]")).getText());
            Thread.sleep(2000);
            //check add comment feature at active feed
            driver.findElement(By.id("inputComment")).sendKeys("comment 1");
            Thread.sleep(2000);
            driver.findElement(By.id("commentBtn")).click();
            Assert.assertNotNull(driver.findElement(By.xpath("//span[@class='userName ng-binding']")).getText());
            Thread.sleep(2000);
            Assert.assertEquals(driver.findElement(By.id("checkName")).getText(),"User Name");
            Thread.sleep(2000);
            driver.findElement(By.xpath("//div[@id='editDel']/div[2]/div/button")).click();
            Thread.sleep(2000);
            driver.quit();
        }else{
            System.out.println("Not able to connect server. Please check the web connection!");
        }
    }
}
