package ru.spart.password_keeper_web.cryptography;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class CryptText {

    private static String key = "aesEncryptionKey";
    private static String initVector = "encryptionIntVec";


    public static void setKeys(String secretKeyLikeLogin) {
        String specialKey = "aesEncryptionKey";
        String spaecialInitVector = "encryptionIntVec";

        key = secretKeyLikeLogin + specialKey;
        initVector = secretKeyLikeLogin + spaecialInitVector;

        key = key.substring(0, 16);
        initVector = initVector.substring(0, 16);
    }


    public static String encryptString(String value) throws Exception {

        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);

            byte[] encrypted = cipher.doFinal(value.getBytes());
            return addLastSymbolToString(Base64.getEncoder().encodeToString(encrypted));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }


    public static String decryptString(String encrypted) {
        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
            byte[] original = cipher.doFinal(Base64.getDecoder().decode(deleteLastSymbolFromString(encrypted)));

            return new String(original);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    private static String deleteLastSymbolFromString(String string){
        return string.substring(0,string.length()-1);
    }

    private static String addLastSymbolToString(String string){
        return string+"\n";
    }
}
