<template>
  <div class="flasher">
    <div class="columns is-mobile is-centered">
      <div class="column">
        <b-button
          id="connect"
          :type="connected ? 'is-warning' : 'is-primary'"
          @click="clickConnect"
        >
          {{ connected ? 'Disconnect' : 'Connect' }}
        </b-button>
      </div>
      <div class="column">
        <b-button
          :disabled="readButtonDisabled"
          @click="readAndParseHeader"
        >
          Read Header
        </b-button>
      </div>
      <div class="column">
        <b-button
          id="read"
          :disabled="readButtonDisabled"
          @click="dumpRom"
        >
          Dump ROM
        </b-button>
      </div>
      <div class="column">
        <b-button
          id="read"
          :disabled="readButtonDisabled"
          @click="dumpRam"
        >
          Dump RAM
        </b-button>
      </div>
    </div>
    <div class="columns is-mobile is-centered">
      <div class="column is-half">
        <b-progress
          :value="readProgress"
          :max="readLength"
        />
      </div>
    </div>

    <div style="text-align: left; margin-left: 37%;">
      <p
        v-for="(value, name) in header"
        :key="name"
      >
        {{ name }}: {{ value }}
      </p>
    </div>
  </div>
</template>

<script>
import serial from '../serial.js'
import constants from '../Constants.js'
import gameboyHeader from '../gameboyHeader.js'

export default {
  name: 'Flasher',
  props: {
  },
  data () {
    return {
      port: undefined,
      connected: false,
      readButtonDisabled: true,
      textEncoder: new TextEncoder(),
      readText: '',
      header: {},
      readingSource: '',
      startTime: undefined,
      readLength: 0,
      readProgress: 0,
      resolver: undefined,
      promise: undefined
    }
  },
  created () {
    this.resetPromise()

    serial.getPorts().then(ports => {
      if (ports.length === 0) {
        console.log('No devices found.')
      } else {
        this.port = ports[0]
        this.connect()
      }
    })
  },
  methods: {
    resetPromise () {
      this.promise = new Promise((resolve) => {
        this.resolver = resolve
      })
    },
    connect () {
      this.port.connect().then(() => {
        this.connected = true
        this.readButtonDisabled = false
        this.port.onReceive = data => {
          const decoded = data.match(/[g-z]+|[^g-z]+/gi)
          decoded.forEach((string) => {
            if (/[G-X]/gm.test(string)) {
              this.decodeAndApplyAction(string)
            } else {
              this.readText += string.toUpperCase()
              // if (Math.round(this.readText.length / 2) - this.readProgress > 100) {
              //   this.readProgress = Math.round(this.readText.length / 2)
              // }
              this.readProgress += Math.round(this.readText.length / 2)
            }
          })
        }
        this.port.onReceiveError = error => {
          console.log('Receive error: ' + error)
        }
      }, error => {
        console.log('Connection error: ' + error)
      })
    },
    async read (address, length) {
      console.log(`reading ${length} bytes starting at address ${address}`)
      this.readText = ''
      try {
        await this.port.send(this.textEncoder.encode(constants.READSTART.value))
        await this.port.send(address)
        await this.port.send(length)
      } catch (error) {
        console.log('Send error: ' + error)
      }
    },
    async write (address, data) {
      try {
        await this.port.send(this.textEncoder.encode(constants.WRITESTART.value))
        await this.port.send(address)
        await this.port.send(data)
      } catch (error) {
        console.log('Send error: ' + error)
      }
    },
    clickConnect () {
      if (this.port) {
        this.port.disconnect()
        this.connected = false
        this.readButtonDisabled = true
        this.port = null
      } else {
        serial.requestPort().then(selectedPort => {
          this.port = selectedPort
          this.connect()
        }).catch(error => {
          console.log('Connection error: ' + error)
        })
      }
    },
    decodeAndApplyAction (action) {
      switch (action) {
        case constants.READSTART.value: // read start
          break
        case constants.READEND.value: // read completed
          if (this.readingSource === 'header') {
            this.readText = this.readText.match(/.{1,2}/g).join(' ')
            this.header = gameboyHeader(this.readText)
            this.resolver()
          } else if (this.readingSource === 'rom') {
            this.resolver()
          } else if (this.readingSource === 'ram') {
            this.resolver()
          }
          break
        case constants.WRITEEND.value: // write completed
          this.resolver()
          break
        default:
          console.log('Unknown action recieved: ', action)
          break
      }
    },
    async readAndParseHeader () {
      this.readingSource = 'header'
      this.read(0x0134, 24)
      await this.promise
      this.resetPromise()
    },
    async dumpRom () {
      this.readButtonDisabled = true
      this.header = {}
      this.startTime = performance.now()
      this.readAndParseHeader()
      await this.promise
      this.resetPromise()
      this.readProgress = 0
      this.readLength = this.header.romSizeBytes
      this.readingSource = 'rom'
      this.read(0, 0x4000)
      await this.promise
      this.resetPromise()
      let rom = this.readText
      // this.readLength / 0x4000
      for (let bank = 1; bank < this.readLength / 0x4000; bank++) {
        this.write(0x2000, bank)
        await this.promise
        this.resetPromise()
        this.read(0x4000, 0x4000)
        await this.promise
        this.resetPromise()
        rom += this.readText
      }
      console.log(`Dumped ROM in ${(performance.now() - this.startTime) / 1000} seconds.`)
      this.downloadRom(rom)
      this.readButtonDisabled = false
    },
    async dumpRam () {
      debugger
      this.readButtonDisabled = true
      this.header = {}
      this.startTime = performance.now()
      this.readAndParseHeader()
      await this.promise
      this.resetPromise()
      this.readProgress = 0
      this.readLength = 8000
      this.readingSource = 'ram'
      this.write(0x0000, 0x0A)
      await this.promise
      this.resetPromise()
      this.write(0xA000, 0xF)
      await this.promise
      this.resetPromise()
      this.write(0xBFFF, 0xF)
      await this.promise
      this.resetPromise()
      this.read(0xA000, 8000)
      await this.promise
      this.resetPromise()
      console.log(`Dumped RAM in ${(performance.now() - this.startTime) / 1000} seconds.`)
      this.write(0x0000, 0x00)
      await this.promise
      this.resetPromise()
      this.downloadRom()
      this.readButtonDisabled = false
    },
    downloadRom (romData = this.readText) {
      var byteArray = new Uint8Array(romData.length / 2)
      for (var x = 0; x < byteArray.length; x++) {
        byteArray[x] = parseInt(romData.substr(x * 2, 2), 16)
      }

      var data = new Blob([byteArray], {
        type: 'application/octet-stream'
      })

      const textFile = window.URL.createObjectURL(data)

      // create the download link, then download it, then destroy it
      var a = document.createElement('a')
      var clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      })
      a.style = 'display: none'
      a.href = textFile
      // check the cgb box to see if the rom should have .gb or .gbc extension
      var name = this.header.title.trim()
      // make sure there is a name
      if (name === '') {
        name = 'logo'
      }
      // if (document.getElementById('cgbSupportSelect').value == '00') {
      if (this.readingSource === 'rom') {
        a.download = name + '.gb'
      } else {
        a.download = name + '.sav'
      }

      // } else {
      //   a.download = name + '.gbc'
      // }
      a.dispatchEvent(clickEvent)
      setTimeout(function () {
        // document.body.removeChild(a);
        window.URL.revokeObjectURL(textFile)
      }, 100)
    }
  }
}
</script>

<style scoped>
</style>
