import { CircleCheck, CircleX, Copy, LoaderCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { capitalize } from "@/utils/stringUtils"
import { DBPortfolioSubmittions } from "@/lib/db.type"
import { SequentialCustomerAccountPortfolioCreationResult } from "@/services/cairoServiceV2"


export const SubmissionDetailsDialog = ({viewingSubmittion, onJsonViewChange}:{viewingSubmittion: DBPortfolioSubmittions, onJsonViewChange: (open:boolean) => void}) => {
    return (
        <Dialog open={true} onOpenChange={onJsonViewChange}>
          <DialogContent className="md:min-w-[600px] lg:min-w-[900px] xl:min-w-[1200px]  no-scrollbar">
            <DialogHeader>
              <DialogTitle>
                {
                  !viewingSubmittion.requestBody.isCompany &&
                  viewingSubmittion.requestBody.mainActor.firstname
                } {viewingSubmittion.requestBody.mainActor.surname}
              </DialogTitle>
              <DialogDescription>
                {viewingSubmittion.requestBody.mainActor.personalNumber}
              </DialogDescription>
            </DialogHeader>

            <span className="text-sm pt-6 flex items-center">
              <span className="font-medium">
                Creation Status:
              </span>
              {viewingSubmittion.status === 'success' ?
                <CircleCheck color="#77bb41" className="ml-5 w-5" />
                : viewingSubmittion.status === 'pending' ?
                  <LoaderCircle color="#000000" className="animate-spin ml-5 w-5" />
                  :
                  <CircleX color="#ff2600" className="w-5 h-5 ml-5" />
              }
              <span className="pl-1">{capitalize(viewingSubmittion.status)}</span>
            </span>
            <div className="text-sm pt-4">
              <div className="font-medium">
                Creation Message:
              </div>
              <span className="">{viewingSubmittion.messages !== '' ? viewingSubmittion.messages : 'No message'}</span>
            </div>
            <div className="text-sm pt-4">
              <div className="font-medium">Account type: </div>
              {viewingSubmittion.requestBody.accountDetails.portfolioTypeCode}, <span className="">({!viewingSubmittion.requestBody.accountDetails.modelPortfolioCode || viewingSubmittion.requestBody.accountDetails.modelPortfolioCode === '' ? 'Diskretionärt' : viewingSubmittion.requestBody.accountDetails.modelPortfolioCode})
              </span>
            </div>
            <div className="flex items-end w-full space-x-2 pb-4 mt-6">
              <div className="flex flex-1 gap-2 flex-col">
                <Label htmlFor="link">
                  Account Id:
                </Label>
                <Input
                  id="link"
                  defaultValue={(viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult)?.portfolioCreation?.payload?.portfolioDescription ?? ''}
                  readOnly
                />
              </div>
              <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult)?.portfolioCreation?.payload?.portfolioDescription ?? '')}>
                <span className="sr-only">Copy</span>
                <Copy />
              </Button>
            </div>


            {viewingSubmittion.requestBody.isCompany &&
              <div>
                <h3 className="text-md font-semibold pt-7">Form input</h3>
                <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto">
                  <span className="font-semibold">Company Name</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.surname} <br /><br />
                  <span className="font-semibold">Organization number</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.personalNumber} <br /><br />
                  <span className="font-semibold">Address</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.address}, {viewingSubmittion.requestBody.mainActor.postalCode}, {viewingSubmittion.requestBody.mainActor.city}
                  {
                    viewingSubmittion.requestBody.mainActor.emailAddress !== '' && (
                      <><br /><br />
                        <span className="font-semibold">Email</span>: <br />
                        {viewingSubmittion.requestBody.mainActor.emailAddress}
                      </>
                    )
                  }
                  {
                    viewingSubmittion.requestBody.mainActor.mobile !== '' && (
                      <><br /><br />
                        <span className="font-semibold">Phone number</span>: <br />
                        {viewingSubmittion.requestBody.mainActor.mobile}
                      </>
                    )
                  }
                  <br /><br />
                  <span className="font-semibold">Account type</span>: <br />
                  {viewingSubmittion.requestBody.accountDetails.portfolioTypeCode}, <span className="">({!viewingSubmittion.requestBody.accountDetails.modelPortfolioCode || viewingSubmittion.requestBody.accountDetails.modelPortfolioCode === '' ? 'Diskretionärt' : viewingSubmittion.requestBody.accountDetails.modelPortfolioCode})</span>
                  <br /><br />
                  <span className="font-semibold">Arvode</span>: <br />
                  {viewingSubmittion.requestBody.accountDetails.feeSubscription.toFixed(2)}
                </pre>
                </div>
              }

              {!viewingSubmittion.requestBody.isCompany &&
              <div>
                <h3 className="text-md font-semibold pt-7">Form input</h3>
                <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto">
                  <span className="font-semibold">Customer name</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.surname} {viewingSubmittion.requestBody.mainActor.surname}<br /><br />
                  <span className="font-semibold">Personnummer</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.personalNumber} <br /><br />
                  <span className="font-semibold">Address</span>: <br />
                  {viewingSubmittion.requestBody.mainActor.address}, {viewingSubmittion.requestBody.mainActor.postalCode}, {viewingSubmittion.requestBody.mainActor.city}
                  {
                    viewingSubmittion.requestBody.mainActor.emailAddress !== '' && (
                      <><br /><br />
                        <span className="font-semibold">Email</span>: <br />
                        {viewingSubmittion.requestBody.mainActor.emailAddress}
                      </>
                    )
                  }
                  {
                    viewingSubmittion.requestBody.mainActor.mobile !== '' && (
                      <><br /><br />
                        <span className="font-semibold">Phone number</span>: <br />
                        {viewingSubmittion.requestBody.mainActor.mobile}
                      </>
                    )
                  }
                  <br /><br />
                  <span className="font-semibold">Account type</span>: <br />
                  {viewingSubmittion.requestBody.accountDetails.portfolioTypeCode}, <span className="">({!viewingSubmittion.requestBody.accountDetails.modelPortfolioCode || viewingSubmittion.requestBody.accountDetails.modelPortfolioCode === '' ? 'Diskretionärt' : viewingSubmittion.requestBody.accountDetails.modelPortfolioCode})</span>
                  <br /><br />
                  <span className="font-semibold">Arvode</span>: <br />
                  {viewingSubmittion.requestBody.accountDetails.feeSubscription.toFixed(2)}
                </pre>
                </div>
              }

                <div>
                  <div className="mt-7">
                  <h3 className="text-md font-semibold">Creation Details</h3>
                  <div className="px-4 border rounded-lg max-w-full">
                  {
                  viewingSubmittion.data ?
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <div className="w-full flex justify-between">
                            <span>
                              Customer Creation
                            </span>
                            <span className="font-light">
                              {capitalize((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.status ?? '')}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="relative grid no-scrollbar">
                            <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0  no-scrollbar">
                              {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.payload, null, 2)}
                            </pre>
                            <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Request body</span>
                          </div>
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.status === 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.skippedOn, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Skipped on</span>
                            </div>
                          }
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.status !== 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).customerCreation.response, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Response</span>
                            </div>
                          }
                        </AccordionContent>
                      </AccordionItem>
                      {
                        (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration &&
                      <AccordionItem value="item-2">
                        <AccordionTrigger>            
                          <div className="w-full flex justify-between">
                            <span>
                              Portal registration
                            </span>
                            <span className="font-light">
                              {capitalize((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.status)}
                            </span>
                          </div>
                          </AccordionTrigger>
                        <AccordionContent>
                          <div className="relative grid">
                            <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                              {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.payload, null, 2)}
                            </pre>
                            <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Request body</span>
                          </div>
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.status === 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.skippedOn, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Skipped on</span>
                            </div>
                          }
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.status !== 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portalUserRegistration!.response, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Response</span>
                            </div>
                          }
                        </AccordionContent>
                      </AccordionItem>
                      }
                      <AccordionItem value="item-3">
                        <AccordionTrigger>            
                          <div className="w-full flex justify-between">
                            <span>
                              Account creation
                            </span>
                            <span className="font-light">
                              {capitalize((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.status ?? '')}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <div className="relative grid">
                            <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                              {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.payload, null, 2)}
                            </pre>
                            <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Request body</span>
                          </div>
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.status === 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.skippedOn, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Skipped on</span>
                            </div>
                          }
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.status !== 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).accountCreation.response, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Response</span>
                            </div>
                          }
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>            
                          <div className="w-full flex justify-between">
                            <span>
                              Portfolio Creation
                            </span>
                            <span className="font-light">
                              {capitalize((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.status ?? '')}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <div className="relative grid">
                            <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                              {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.payload, null, 2)}
                            </pre>
                            <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Request body</span>
                          </div>
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.status === 'skipped' &&
                            <div className="relative mt-4 grid">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.skippedOn, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Skipped on</span>
                            </div>
                          }
                          {
                            (viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.status !== 'skipped' &&
                            <div className="relative mt-4 grid no-scrollbar">
                              <pre  className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                {JSON.stringify((viewingSubmittion.data as SequentialCustomerAccountPortfolioCreationResult).portfolioCreation.response, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Response</span>
                            </div>
                          }                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>            
                          <div className="w-full flex justify-between">
                            <span>
                              Subscription Creation
                            </span>
                            <span className="font-light">
                              {
                                (viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).subscriptionCreation.every(a => a.status === 'success' || a.status === 'skipped') ? 'Success' 
                                : (viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).subscriptionCreation.every(a => a.status === 'not exercuted') ? 'Not exercuted'
                                : (viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).subscriptionCreation.some(a => a.status === 'failed') ? 'Failed'
                                : (viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult).subscriptionCreation.some(a => a.status === 'aborted') ? 'aborted'
                                : 'error'
                              }
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    : <div className="text-sm py-3">The creation process is not yet started, please wait...</div>}
                  </div>
                </div>

  
              </div>


            {
              /**
              <div className="grid gap-4 py-4">
                <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{jsonDataView}</pre>
              </div>
               */
            }

            <DialogFooter>
              <Button className="mt-7" variant='outline' type="button" onClick={() => onJsonViewChange(false)}>Close</Button>
              <Button className="mt-7" type="button" onClick={() => navigator.clipboard.writeText((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult)?.portfolioCreation?.payload?.portfolioDescription ?? '')}>Copy JSON</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}