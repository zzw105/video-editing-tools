const { exec } = require("child_process");
// �����ǰĿ¼����һ���Ǵ������ڵ�Ŀ¼���µ��ļ����ļ���
exec("dir", (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
