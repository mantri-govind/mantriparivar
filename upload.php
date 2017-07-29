<!DOCTYPE html>
<html>
<body>

<form action="save.php" method="post" enctype="multipart/form-data">
   कृपया छोटी साइज की फोटो भेजे। फोटो का नाम सदस्य के नाम का अग्रिम शब्द  व पिता का नाम  रखे उदारण के लिए अगर आप का नाम सूचि मैं गोविन्द है तो फोटो का नाम "Govind-Champalal" रखे ताकि नाम ढूढ़ने मैं आसानी हो।  
    <input type="file" name="fileToUpload" id="fileToUpload" required>
    <input type="text" name="name" id="name_of_person" required>
    <input type="submit" value="Upload Image" name="submit">
</form>

</body>
</html>