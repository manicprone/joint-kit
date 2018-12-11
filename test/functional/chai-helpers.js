import chaiAsPromised from 'chai-as-promised'

export default function chaiHelpers(chai) {
  const { Assertion, expect } = chai

  chai.use(chaiAsPromised)

  Assertion.addMethod('rejectedWithJointStatusError', function rejectedWithJointStatusError(statusCode) {
    return expect(this).to.eventually.be.rejected
      .and.have.keys('name', 'status', 'message')
      .and.have.property('status', statusCode)
  })
}
