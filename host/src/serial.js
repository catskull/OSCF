var serial = {};

(function () {
  'use strict'

  const textEncoder = new TextEncoder()
  const textDecoder = new TextDecoder()

  serial.getPorts = function () {
    return navigator.usb.getDevices().then(devices => {
      return devices.map(device => new serial.Port(device))
    })
  }

  serial.requestPort = function () {
    const filters = [
      { vendorId: 0x1a86, productId: 0x7523 }
    ]
    return navigator.usb.requestDevice({ filters: filters }).then(
      device => new serial.Port(device)
    )
  }

  serial.Port = function (device) {
    this.device_ = device
    this.interfaceNumber_ = 2 // original interface number of WebUSB Arduino demo
    this.endpointIn_ = 2 // original in endpoint ID of WebUSB Arduino demo
    this.endpointOut_ = 2 // original out endpoint ID of WebUSB Arduino demo
  }

  serial.Port.prototype.connect = function () {
    const readLoop = () => {
      this.device_.transferIn(this.endpointIn_, 32).then(result => {
        this.onReceive(textDecoder.decode(result.data))
        readLoop()
      }, error => {
        console.log(error)
        this.onReceiveError(error)
      })
    }

    return this.device_.open()
      .then(() => {
        if (this.device_.configuration === null) {
          return this.device_.selectConfiguration(1)
        }
      })
      .then(() => {
        var configurationInterfaces = this.device_.configuration.interfaces
        configurationInterfaces.forEach(element => {
          element.alternates.forEach(elementalt => {
            if (elementalt.interfaceClass === 0xff) {
              this.interfaceNumber_ = element.interfaceNumber
              elementalt.endpoints.forEach(elementendpoint => {
                if (elementendpoint.direction === 'out' && elementendpoint.type === 'bulk') {
                  this.endpointOut_ = elementendpoint.endpointNumber
                }
                if (elementendpoint.direction === 'in' && elementendpoint.type === 'bulk') {
                  this.endpointIn_ = elementendpoint.endpointNumber
                }
              })
            }
          })
        })
      })
      .then(() => this.device_.claimInterface(this.interfaceNumber_))
    // .then(() => this.device_.selectAlternateInterface(this.interfaceNumber_, 0))
    // TODO: Figure out what control transfer I should use
      .then(() => this.device_.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x01,
        index: this.interfaceNumber_
      }))
      .then(() => {
        readLoop()
      })
  }

  serial.Port.prototype.disconnect = function () {
    return this.device_.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x00,
      index: this.interfaceNumber_
    })
      .then(() => this.device_.close())
  }

  serial.Port.prototype.send = function (data) {
    var payload
    if (typeof data === 'string') {
      payload = textEncoder.encode(data)
    } else {
      payload = new Uint16Array([data])
    }
    return this.device_.transferOut(this.endpointOut_, payload)
  }
})()

export default serial
