---
sidebar_position: 9
---

# Enroll Device

Enrollment ensures that all devices trying to access data within your organization are secure and compliant with your policies and requirements. Upon enrollment, the device gets access to resources like work email, files, VPN, and Wi-Fi.

For information how to enroll the device, refer to [Step 5: Enroll a device](https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-enroll-windows-device) of the Microsoft Intune evaluation guide.

To confirm that the device was successfully enrolled, open Computer certificate store and check:
- device certificate installed under **Local Computer >> Personal >> Certificates**
- trusted root CA certificate installed under **Local Computer >> Trusted Root Certification Authorities >> Certificates**
- trusted issuing CA certificate installed under **Local Computer >> Intermediate Certification Authorities >> Certificates**

Also, you can sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431) and check that you have an additional device enrolled within Intune.

If you want to remove device from the Intune, refer to [Remove your Windows device from management](https://learn.microsoft.com/en-us/mem/intune/user-help/unenroll-your-device-from-intune-windows).
