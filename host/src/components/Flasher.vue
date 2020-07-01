<template>
  <div class="flasher">
    <b-button
      id="connect"
      :type="connected ? 'is-warning' : 'is-primary'"
      @click="clickConnect"
    >
      {{ connected ? 'Disconnect' : 'Connect' }}
    </b-button>
    <b-button
      id="read"
      :disabled="readButtonDisabled"
      @click="read(0x0134, 24)"
    >
      Read Header
    </b-button>
    <p style="word-break: break-word;">
      {{ readText }}
    </p>
  </div>
</template>

<script>
import serial from '../serial.js'
import constants from '../Constants.js'

export default {
  name: 'Flasher',
  props: {
  },
  data () {
    return {
      port: undefined,
      connected: false,
      readButtonDisabled: true,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      readText: ''
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
      // t.io.println('Connecting to ' + this.port.device_.productName + '...');
      this.port.connect().then(() => {
        this.connected = true
        this.readButtonDisabled = false
        this.port.onReceive = data => {
          // read serial input and split into 2 character chunks
          // normally input is already in chunks, but for some reason the last 2 bytes get combined
          const decoded = data.match(/[a-z]+|[^a-z]+/gi)
          decoded.forEach((string) => {
            if (/[G-X]/gm.test(string)) {
              this.decodeAndApplyAction(string)
            } else {
              this.readText += parseInt(string).toString(16).padStart(2, '0').toUpperCase()
              this.readText += ' '
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
    stringIsHex (text) {
      return text.match(/^[A-Fa-f0-9]{2}$/i) !== null
    },
    decodeAndApplyAction (action) {
      switch (action) {
        case constants.READSTART.value: // read start
          this.readText = ''
          break
        case constants.READEND.value: // read completed
          this.readButtonDisabled = false
          break
        default:
          console.log('Unknown action recieved: ', action)
          break
      }
    }
  }
}
</script>

<style scoped>
</style>
