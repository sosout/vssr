import path from 'path'
import fs from 'fs'
import hash from 'hash-sum'
import consola from 'consola'
import { chainFn, sequence } from '../common/utils'

export default class ModuleContainer {
  constructor(vssr) {
    this.vssr = vssr
    this.options = vssr.options
    this.requiredModules = {}
  }

  async ready() {
    // Call before hook

  }
}
