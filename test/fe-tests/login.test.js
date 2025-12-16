const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("UI Login", function () {
  this.timeout(20000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  it("Email and password empty - tc01", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys("");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath("//*[contains(text(), 'Please enter your email address.')]")
    );
    const text = await el.getText();
    expect(text).to.include("Please enter your email address.");
  });

  it("Empty password - tc02", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user@gmail.com");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath("//*[contains(text(), 'Please enter your password.')]")
    );
    const text = await el.getText();
    expect(text).to.include("Please enter your password.");
  });

  it("Empty email - tc03", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys("");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath("//*[contains(text(), 'Please enter your email address.')]")
    );
    const text = await el.getText();
    expect(text).to.include("Please enter your email address.");
  });

  it("Password is Ab1 - tc04", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user@gmail.com");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("Ab1");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must be at least 8 characters long.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include("Password must be at least 8 characters long.");
  });

  it("Password missing special characters - tc05", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcdef1234");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  });

  it("Password missing number - tc06", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcdefgh");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  });

  it("Password missing uppercase letter - tc07", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("abcd1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  });

  it("Password missing uppercase, lowercase letter and special character - tc08", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("12345678");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  });

  it("Invalid email format - tc09", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Invalid email format. Please check your email address.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Invalid email format. Please check your email address."
    );
  });

  it("Invalid email format and invalid password format - tc10", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1gmail.com");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("Ab1");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Invalid email format. Please check your email address.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Invalid email format. Please check your email address."
    );
  });

  it("Successful login - tc11", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("uyentu510@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    await driver.wait(until.urlContains("/home"), 10000);

    const url = await driver.getCurrentUrl();
    expect(url).to.include("/home");
  });

  it("Empty email and invalid password format - tc12", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys("");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("Ab1");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath("//*[contains(text(), 'Please enter your email address.')]")
    );
    const text = await el.getText();
    expect(text).to.include("Please enter your email address.");
  });

  it("Invalid email and password is missing lowercase and uppercase letter - tc13", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("1234567!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();
    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Invalid email format. Please check your email address.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Invalid email format. Please check your email address."
    );
  });

  it("Unverified email + wrong password - tc14", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user3@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();
    const alertXpath = "//*[contains(text(),'Invalid email or password')]";

    const el = await driver.wait(
      until.elementLocated(By.xpath(alertXpath)),
      10000
    );
    await driver.wait(until.elementIsVisible(el), 10000);

    const text = await el.getText();
    expect(text).to.include("Invalid email or password");
  });

  it("Wrong password - tc15", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("uyentu510@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234@");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Invalid email or password')]")
      ),
      5000
    );

    const text = await el.getText();
    expect(text).to.include("Invalid email or password");
  });

  it("Password missing lowercase letter - tc16", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user1@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("A12345678!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.findElement(
      By.xpath(
        "//*[contains(text(), 'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')]"
      )
    );
    const text = await el.getText();
    expect(text).to.include(
      "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  });

  it("Unverified email + true password - tc17", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user3@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("True1234!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Unverified account')]")
      ),
      5000
    );
    const text = await el.getText();
    expect(text).to.include("Unverified account");
  });

  it("User not found - tc18", async () => {
    await driver.get(config.frontendUrl + "/login");

    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("user2@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Wrong123!");

    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();

    const el = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Invalid email or password')]")
      ),
      5000
    );
    const text = await el.getText();
    expect(text).to.include("Invalid email or password");
  });
});
