from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.implicitly_wait(10)

try:
    driver.get("https://www.wikipedia.org")

    search_box = driver.find_element(By.NAME, "search")
    search_box.send_keys("selenium web driver")
    search_box.submit()

    page_text = driver.find_element(By.TAG_NAME, "body").text.lower()

    if "selenium" in page_text:
        print("Le mot 'selenium' est present dans la page.")
    else:
        print("Le mot 'selenium' n'est pas present dans la page.")
finally:
    driver.quit()