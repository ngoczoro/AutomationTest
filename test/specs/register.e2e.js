import assert from "assert";

describe("Register Module", () => {
  //
  // TC-REGISTER 01
  //
  it("TC-Register01 - Email empty → MSG001", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abcd@1234");
    assert.equal(await password.getValue(), "Abcd@1234");

    const email = $("#email");
    await email.setValue("");
    assert.equal(await email.getValue(), "");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abcd@1234");
    assert.equal(await confirm.getValue(), "Abcd@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $('//*[contains(text(),"Please enter your email")]');
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG001 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });

  //
  // TC-REGISTER 02
  //
  it("TC-Register02 - Password empty → MSG002", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("");
    assert.equal(await password.getValue(), "");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abcd@1234");
    assert.equal(await confirm.getValue(), "Abcd@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $('//*[contains(text(),"Please enter your password")]');
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG002 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });

  //
  // TC-REGISTER 03
  //
  it("TC-Register03 - Full name empty → MSG003", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("");
    assert.equal(await fullName.getValue(), "");

    const password = $("#password");
    await password.setValue("Abcd@1234");
    assert.equal(await password.getValue(), "Abcd@1234");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abcd@1234");
    assert.equal(await confirm.getValue(), "Abcd@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $('//*[contains(text(),"Please enter your full name")]');
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG003 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 04
  //
  it("TC-Register04 - Confirm Password empty → MSG004", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abcd@1234");
    assert.equal(await password.getValue(), "Abcd@1234");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("");
    assert.equal(await confirm.getValue(), "");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $('//*[contains(text(),"Please confirm your password")]');
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG004 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 05
  //
  it("TC-Register05 - Invalid email format → MSG005", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abcd@1234");
    assert.equal(await password.getValue(), "Abcd@1234");

    const email = $("#email");
    await email.setValue("user-example");
    assert.equal(await email.getValue(), "user-example");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abcd@1234");
    assert.equal(await confirm.getValue(), "Abcd@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Invalid email format. Please check your email address")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG005 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 06
  //
  it("TC-Register06 - Password must be at least 8 characters long → MSG009", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("abc123");
    assert.equal(await password.getValue(), "abc123");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("abc123");
    assert.equal(await confirm.getValue(), "abc123");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password must be at least 8 characters long")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG009 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 07
  //
  it("TC-Register07 - Invalid password format → MSG006", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("ABC1234@");
    assert.equal(await password.getValue(), "ABC1234@");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("ABC1234@");
    assert.equal(await confirm.getValue(), "ABC1234@");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG006 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 08
  //
  it("TC-Register08 - Invalid password format → MSG006", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("abc1234@");
    assert.equal(await password.getValue(), "abc1234@");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("abc1234@");
    assert.equal(await confirm.getValue(), "abc1234@");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG006 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 09
  //
  it("TC-Register09 - Invalid password format → MSG006", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abc12345");
    assert.equal(await password.getValue(), "Abc12345");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abc12345");
    assert.equal(await confirm.getValue(), "Abc12345");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG006 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 10
  //
  it("TC-Register10 - Invalid password format → MSG006", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abc12345");
    assert.equal(await password.getValue(), "Abc12345");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("ABCdefg@");
    assert.equal(await confirm.getValue(), "ABCdefg@");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG006 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 11
  //
  it("TC-Register11 - Password and Confirm Password do not match → MSG007", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abcd@1234");
    assert.equal(await password.getValue(), "Abcd@1234");

    const email = $("#email");
    await email.setValue("user01@example.com");
    assert.equal(await email.getValue(), "user01@example.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abcd@5678");
    assert.equal(await confirm.getValue(), "Abcd@5678");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $(
      '//*[contains(text(),"Password and Confirm Password do not match")]'
    );
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG007 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 12
  //
  it("TC-Register12 - Email already used → MSG008", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abc@1234");
    assert.equal(await password.getValue(), "Abc@1234");

    const email = $("#email");
    await email.setValue("23521019@gm.uit.edu.vn");
    assert.equal(await email.getValue(), "23521019@gm.uit.edu.vn");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abc@1234");
    assert.equal(await confirm.getValue(), "Abc@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    const errorMsg = $('//*[contains(text(),"Email already used")]');
    await browser.waitUntil(() => errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG008 not shown",
    });

    currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"));

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 13
  //
  it("TC-Register13 - System creates unverified account and navigates to Verify Email page", async () => {
    await browser.url("/register");

    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/register"), "Register page not loaded");

    const fullName = $("#fullName");
    await fullName.setValue("user01");
    assert.equal(await fullName.getValue(), "user01");

    const password = $("#password");
    await password.setValue("Abc@1234");
    assert.equal(await password.getValue(), "Abc@1234");

    const email = $("#email");
    await email.setValue("daongoc.work@gmail.com");
    assert.equal(await email.getValue(), "daongoc.work@gmail.com");

    const confirm = $("#confirmPassword");
    await confirm.setValue("Abc@1234");
    assert.equal(await confirm.getValue(), "Abc@1234");

    const registerBtn = $('button[type="submit"]');
    await registerBtn.click();

    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes("verify-email") || url.includes("otp");
      },
      {
        timeout: 5000,
        timeoutMsg: "Did not navigate to Verify Email page",
      }
    );

    currentUrl = await browser.getUrl();
    assert(
      currentUrl.includes("verify-email") || currentUrl.includes("otp"),
      "Did not navigate to OTP / Verify Email page"
    );

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 14
  //
  it("TC-Register14 - OTP field is empty → MSG038 ", async () => {
    const otpInput = $("#otp");
    await otpInput.setValue("");
    assert.equal(await otpInput.getValue(), "");

    const verifyBtn = $('button[type="submit"]');
    await verifyBtn.click();

    const errorMsg = $('//*[contains(text(),"Please enter OTP")]');

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG038 – Please enter OTP not shown",
    });

    currentUrl = await browser.getUrl();
    assert(
      currentUrl.includes("verify") || currentUrl.includes("otp"),
      "Should remain on Verify Email page after validation error"
    );

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 15
  //
  it("TC-Register15 - OTP field is empty → MSG039", async () => {
    const otpInput = $("#otp");
    await otpInput.setValue("123456");
    assert.equal(await otpInput.getValue(), "123456");

    const verifyBtn = $('button[type="submit"]');
    await verifyBtn.click();

    const errorMsg = $('//*[contains(text(),"Invalid or expired OTP")]');

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "MSG039 – Invalid or expired OTP",
    });

    currentUrl = await browser.getUrl();
    assert(
      currentUrl.includes("verify") || currentUrl.includes("otp"),
      "Should remain on Verify Email page after validation error"
    );

    await browser.pause(1000);
  });
  //
  // TC-REGISTER 16
  //
  it("TC-Register16 - Verify success", async () => {
    await browser.pause(15000);
    // có 15 giây để nhập OTP và nhấn Verify

    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes("login");
      },
      {
        timeout: 7000,
        timeoutMsg: "Did not navigate to Login page (OTP incorrect or timeout)",
      }
    );

    currentUrl = await browser.getUrl();
    assert(
      currentUrl.includes("login"),
      "Account not activated or not redirected to success page"
    );

    console.log("OTP verified successfully!");
    await browser.pause(1000);
  });
});
