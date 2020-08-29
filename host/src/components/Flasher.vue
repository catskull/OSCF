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
      readProgress: 0
    }
  },
  created () {
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
              if (Math.round(this.readText.length / 2) - this.readProgress > 100) {
                this.readProgress = Math.round(this.readText.length / 2)
              }
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
    read (address, length) {
      console.log(`reading ${length} bytes starting at address ${address}`)
      this.readText = ''
      this.readButtonDisabled = true
      this.port.send(this.textEncoder.encode(constants.READSTART.value))
        .then(this.port.send(address))
        .then(this.port.send(length))
        .catch(error => {
          console.log('Send error: ' + error)
        })
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
          this.dumpRom()
          break
        case constants.READEND.value: // read completed
          this.readButtonDisabled = false
          if (this.readingSource === 'header') {
            this.readText = this.readText.match(/.{1,2}/g).join(' ')
            this.header = gameboyHeader(this.readText)
          } else if (this.readingSource === 'rom') {
            this.readProgress = this.readLength
            console.log(`Dumped ROM in ${(performance.now() - this.startTime) / 1000} seconds.`)
            this.downloadRom()
          }
          break
        default:
          console.log('Unknown action recieved: ', action)
          break
      }
    },
    readAndParseHeader () {
      this.readingSource = 'header'
      this.read(0x0134, 24)
    },
    async dumpRom () {
      this.header = {}
      this.startTime = performance.now()
      this.readAndParseHeader()
      while (Object.keys(this.header).length === 0 && this.header.constructor === Object) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      this.readProgress = 0
      let size = 0
      switch (this.header.romSize) {
        case '32 KByte':
          size = 32 * 1000
          break
        case '64 KByte':
          size = 64 * 1000
          break
        case '128 KByte':
          size = 128 * 1000
          break
        case '256 KByte':
          size = 256 * 1000
          break
        case '512 KByte':
          size = 512 * 1000
          break
        case '1 MByte':
          size = 1000 * 1000
          break
        case '2 MByte':
          size = 2000 * 1000
          break
        case '4 MByte':
          size = 4000 * 1000
          break
        case '8 MByte':
          size = 8000 * 1000
          break
        case '1.1 MByte':
          size = 1.1 * 1000
          break
        case '1.2 MByte':
          size = 1.2 * 1000
          break
        case '1.5 MByte':
          size = 1.5 * 1000
          break
      }
      size = 32 * 1000
      this.readLength = size
      this.readingSource = 'rom'
      this.read(0, size)
    },
    downloadRom () {
      var byteArray = new Uint8Array(this.readText.length / 2)
      for (var x = 0; x < byteArray.length; x++) {
        byteArray[x] = parseInt(this.readText.substr(x * 2, 2), 16)
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
      a.download = name + '.gb'
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
