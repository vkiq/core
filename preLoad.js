;(async () => {
  // Environment Check
  try {
    if (
      !require('fs')
        .statSync('./node_modules')
        .isDirectory()
    )
      throw new Error()
  } catch (error) {
    console.log('正在完成安装，这可能需要一些时间。')
    const inst = new Promise((resolve, reject) => {
      require('child_process')
        .exec('npm i --production --registry=https://registry.npm.taobao.org')
        .on('exit', (code) => {
          if (code === 0) resolve()
          else reject()
        })
    })
    await inst.catch(() => {
      console.log('安装失败。请检查日志或询问开发者。')
      process.exit(1)
    })
    console.log('安装完成。感谢使用VkiQ。')
    require('./index')
  }
})()
