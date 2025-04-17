import { CircleCheck, CircleX, Copy, LoaderCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { camelToNormalCase, capitalize } from "@/utils/stringUtils"
import { DBPortfolioSubmittions } from "@/lib/db.type"
import { CairoExercutionResult, SequentialCustomerAccountPortfolioCreationResult } from "@/services/cairoServiceV2"
import { useEffect, useState } from "react"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"


export const SubmissionDetailsDialog = ({ viewingSubmittion, onJsonViewChange }: { viewingSubmittion: DBPortfolioSubmittions, onJsonViewChange: (open: boolean) => void }) => {
  return (
    <Dialog open={true} onOpenChange={onJsonViewChange}>
      <DialogContent className="md:min-w-[600px] lg:min-w-[900px] xl:min-w-[1200px]  no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-left">
            {
              !viewingSubmittion.requestBody.isCompany &&
              viewingSubmittion.requestBody.mainActor.firstname
            } {viewingSubmittion.requestBody.mainActor.surname}
          </DialogTitle>
          <DialogDescription className="text-left">
            {viewingSubmittion.requestBody.mainActor.personalNumber}
          </DialogDescription>
        </DialogHeader>

        <span className="text-sm pt-6 flex items-center">
          <span className="font-medium">
            Status:
          </span>
          {viewingSubmittion.status === 'success' ?
            <CircleCheck color="#77bb41" className="ml-3 w-5" />
            : viewingSubmittion.status === 'pending' ?
              <LoaderCircle color="#000000" className="animate-spin ml-3 w-5" />
              :
              <CircleX color="#ff2600" className="w-5 h-5 ml-3" />
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
        <div className="text-sm pt-4">
          <div className="font-medium">Created date:</div>
          {new Date(viewingSubmittion.createdAt).toLocaleDateString('sv-SE')} ({new Date(viewingSubmittion.createdAt).toLocaleTimeString('sv-SE')})
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


        <div>
          <h3 className="text-md font-semibold pt-7">
            {
              viewingSubmittion.requestBody.isCompany ? 'Company details' : 'Customer details'
            }
          </h3>
          <div className="relative grid no-scrollbar">
            <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto text-wrap">
              <span className="font-semibold">{viewingSubmittion.requestBody.isCompany ? 'Company Name' : 'Customer Name'}</span>: <br />
              {viewingSubmittion.requestBody.mainActor.surname} {viewingSubmittion.requestBody.mainActor.firstname}<br /><br />
              <span className="font-semibold">{viewingSubmittion.requestBody.isCompany ? 'Organization number' : 'Social security number'}</span>: <br />
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
            </pre>
          </div>
        </div>

        {viewingSubmittion.requestBody.representor &&
          <div>
            <h3 className="text-md font-semibold pt-7">Representor</h3>
            <div className="relative grid no-scrollbar">
              <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto text-wrap">
                <span className="font-semibold">Name</span>: <br />
                {viewingSubmittion.requestBody.representor.surname} {viewingSubmittion.requestBody.representor.firstname} <br /><br />
                <span className="font-semibold">Organization number</span>: <br />
                {viewingSubmittion.requestBody.representor.personalNumber} <br /><br />
                <span className="font-semibold">Address</span>: <br />
                {viewingSubmittion.requestBody.representor.address}, {viewingSubmittion.requestBody.representor.postalCode}, {viewingSubmittion.requestBody.representor.city}
                {
                  viewingSubmittion.requestBody.representor.emailAddress !== '' && (
                    <><br /><br />
                      <span className="font-semibold">Email</span>: <br />
                      {viewingSubmittion.requestBody.representor.emailAddress}
                    </>
                  )
                }
                {
                  viewingSubmittion.requestBody.representor.mobile !== '' && (
                    <><br /><br />
                      <span className="font-semibold">Phone number</span>: <br />
                      {viewingSubmittion.requestBody.representor.mobile}
                    </>
                  )
                }
              </pre>
            </div>
          </div>
        }


        <div>
          <h3 className="text-md font-semibold pt-7">Account details</h3>
          <div className="relative grid no-scrollbar">
            <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto text-wrap">
              <span className="font-semibold">Account type</span>: <br />
              {viewingSubmittion.requestBody.accountDetails.portfolioTypeCode}, <span className="">({!viewingSubmittion.requestBody.accountDetails.modelPortfolioCode || viewingSubmittion.requestBody.accountDetails.modelPortfolioCode === '' ? 'Diskretionärt' : viewingSubmittion.requestBody.accountDetails.modelPortfolioCode})</span>
              <br /><br />
              <span className="font-semibold">Arvode</span>: <br />
              {viewingSubmittion.requestBody.accountDetails.feeSubscription.toFixed(2)}%
            </pre>
          </div>
        </div>

        {
          viewingSubmittion.requestBody.payment && (
            <div>
              <h3 className="text-md font-semibold pt-7">Payment details</h3>
              <pre className="p-4 text-sm bg-gray-100 rounded-md overflow-auto text-wrap">
                <span className="font-semibold">Account number:</span> <br />
                {viewingSubmittion.requestBody.payment.clearingNumber},{viewingSubmittion.requestBody.payment.accountNumber}
                <br /><br />
                <span className="font-semibold">Initial deposits:</span> <br />
                {
                  viewingSubmittion.requestBody.payment.deposit ? viewingSubmittion.requestBody.payment.deposit.map((a, i) => (
                    <div key={i}>
                      {a.amount.toFixed(2)}:- ({a.isRecurring ? 'Monthly' : 'Ontime'})<br />
                    </div>
                  )) : <div>No initial deposits.</div>
                }
              </pre>
            </div>
          )
        }


        <CreationDetails viewingSubmittion={viewingSubmittion} />



        {
          /**
          <div className="grid gap-4 py-4">
            <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{jsonDataView}</pre>
          </div>
           */
        }

        <DialogFooter className="mt-7">
          <Button className="mt-7" variant='outline' type="button" onClick={() => onJsonViewChange(false)}>Close</Button>
          {/*<Button className="mt-7" type="button" onClick={() => navigator.clipboard.writeText((viewingSubmittion?.data as SequentialCustomerAccountPortfolioCreationResult)?.portfolioCreation?.payload?.portfolioDescription ?? '')}>Copy JSON</Button>*/}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreationDetails({ viewingSubmittion: viewingData }: { viewingSubmittion: DBPortfolioSubmittions }) {
  const [data, setData] = useState<Session | null>(null)
  const session = useSession()

  useEffect(() => {
    setData(session.data) // prevent hidration error
  }, [data, session])

  if (!data?.user.role || data.user.role !== 'admin') {
    return
  }

  if (viewingData.status === 'pending' && !viewingData.data) {
    return (
      <div>
        <div className="mt-7">
          <h3 className="text-md font-semibold">Creation Details</h3>
          <div className="px-4 border rounded-lg max-w-full">
            <div className="text-sm py-3">The creation process is not yet started, please wait...</div>
          </div>
        </div>
      </div>
    )
  }

  if (viewingData.data) {
    const data: SequentialCustomerAccountPortfolioCreationResult = viewingData.data as SequentialCustomerAccountPortfolioCreationResult

    return (
      <div>
        <div className="mt-7">
          <h3 className="text-md font-semibold">Creation Details</h3>
          <div className="px-4 border rounded-lg max-w-full">
            <Accordion type="single" collapsible className="w-full">
              {
                Object.entries(data).map(([key, values]) => {
                  if (values === null || values === undefined) {
                    return null
                  }

                  values = values as CairoExercutionResult<any, any>
                  console.log(key, values)


                  const steps = Array.isArray(values) ? values : [values]

                  return steps.map((value, index) => {

                    return (
                      <AccordionItem value={key + '-' + index} id={key + '' + index} key={key + '' + index}>
                        <div>
                          <AccordionTrigger>
                            <div className="w-full flex justify-between">
                              <span>
                                {camelToNormalCase(steps.length === 1 ? key : `${key}(${index+1})`)}
                              </span>
                              <span className="font-light">
                                {capitalize(value.status ?? '')}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="relative grid no-scrollbar">
                              <pre className="p-4 bg-gray-100 rounded-md overflow-auto z-0  no-scrollbar">
                                {JSON.stringify(value.payload, null, 2)}
                              </pre>
                              <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Request payload</span>
                            </div>
                            {
                              value.skippedOn &&
                              <div className="relative mt-4 grid">
                                <pre className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                  {JSON.stringify(value.skippedOn, null, 2)}
                                </pre>
                                <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Skipped on</span>
                              </div>
                            }
                            {
                              value.response &&
                              <div className="relative mt-4 grid">
                                <pre className="p-4 bg-gray-100 rounded-md overflow-auto z-0 no-scrollbar">
                                  {JSON.stringify(value.response, null, 2)}
                                </pre>
                                <span className="absolute top-0 right-0 m-2 bg-black text-white px-2 py-1 rounded-sm z-50">Response</span>
                              </div>
                            }
                          </AccordionContent>
                        </div>
                      </AccordionItem>
                    )
                  })
                })
              }
            </Accordion>
          </div>
        </div>
      </div>
    )
  }
}