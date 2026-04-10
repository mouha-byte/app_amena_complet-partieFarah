from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

import time

# Ouvrir le navigateur Chrome
driver = webdriver.Chrome()

# Ouvrir Wikipedia
driver.get("https://www.wikipedia.org")

# # Récupérer le titre de la page
# title = driver.title

# # Afficher le titre
# print("Titre de la page :", title)

# # Vérifier que le titre contient Wikipedia
# assert "Wikipedia" in title, "Le titre ne contient pas 'Wikipedia'"

# # Trouver le champ de recherche
# search_box = driver.find_element(By.NAME, "search")

# # Entrer Selenium WebDriver
# search_box.send_keys("Selenium WebDriver")
# search_box.send_keys(Keys.RETURN)

# time.sleep(3)

# # Vérifier que la page contient Selenium
# assert "Selenium" in driver.page_source, \
#     "Le texte 'Selenium' n’a pas été trouvé sur la page de résultats."

# print("Le texte Selenium est présent dans la page")

# # Vérifier que la page contient welcome
# try:
#     assert "welcome" in driver.page_source, \
#         "Le texte 'welcome' n’a pas été trouvé sur la page de résultats."
#     print("Le texte welcome est présent")
    
# except AssertionError as e:
#     print(f"Erreur détectée : {e}")

# Attendre 5 secondes
english_button = driver.find_element(By.ID, "js-link-box-en")
english_button.click()

# try:
#     assert "en.wikipedia.org" in driver.current_url, \
#     f"L'URL n'est pas correcte : {driver.current_url}"
#     print("Navigation réussie vers la version anglaise.")
# except AssertionError as e:
#     print(f"Erreur détectée : {e}")

time.sleep(5)
external_link = driver.find_element(By.LINK_TEXT,"Wikimedia Foundation")
external_link.click()
time.sleep(5)
current_url = driver.current_url
print("URL actuelle après le clic :", current_url)
# Vérification si l'URL contient "Wikimedia_Foundation"

assert "Wikimedia_Foundation" in current_url, f"Le lien n'a pas redirigé correctement vers la page interne de Wikimedia Foundation. URL actuelle : {current_url}"
assert "Wikimedia_Foundation" in current_url, f"Le lien n'a pas redirigé correctement vers la page interne de Wikimedia Foundation. URL actuelle : {current_url}"

# Récupérer et afficher le titre de la page Wikimedia
title = driver.title
# Afficher le titre de la page
print(f"Le titre de la page est : {title}")
# Afficher la longueur du titre dans la console
print(f"La longueur du titre de la page est :{len(title)} caractères.")
# Vérifier que le titre n'est pas vide
assert len(title) > 0, "Le titre de la page est vide."



# Fermer le navigateur
driver.quit()
