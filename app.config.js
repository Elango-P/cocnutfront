export default {
  expo: {
    name: "Coconut Front",
    slug: "coconut-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/coconut.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./src/assets/coconut.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    android: {
      package: "com.elango.coconutmobile", // Change the package name to use only allowed characters
      versionCode: 1,
    },
    extra: {
      eas: {
        projectId: "445fdac8-9d8f-4ef1-8950-bbf347908ebb"
      }
    },
    owner: "elangoela"
    // ...other config options
  },
};
