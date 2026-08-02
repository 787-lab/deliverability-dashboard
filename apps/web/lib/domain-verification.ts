export function verificationTxtRecord(domainName: string, token: string) {
  return { host: `_advazon-verify.${domainName}`, value: `advazon-verify=${token}` };
}
