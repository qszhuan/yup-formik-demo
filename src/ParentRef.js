import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";

const SplitType = {
  Percentage: "Percentage",
  Value: "Value",
};
const ParentRef = () => {
  return (
    <Formik
      initialValues={{
        splitType: SplitType.Percentage,
        splits: [10, 90],
        total: 1000,
      }}
      validationSchema={Yup.object({
        splitType: Yup.mixed().oneOf([SplitType.Percentage, SplitType.Value]),
        total: Yup.number().required(),
        splits: Yup.array()
          .required("must contains at least one split")
          // Use this or the test() for items in array below
        //   .when("splitType", function (splitType, schema) {
        //     console.log("SPLIT TYPE:", splitType);
        //     return splitType === SplitType.Percentage ?
        //     schema.of(
        //       Yup.number().moreThan(0, "(0, 100]").max(100, "(0, 100]")
        //     )
        //     :schema.of(
        //         Yup.number().min(0)
        //       )
        //     ;
        //   })
          .test('total amount', 'the total does not match', function(value){
              console.log(value);
              if(this.parent.splitType === SplitType.Value){
                  return value.reduce((a,b)=>a+b, 0) === this.parent.total;
              }
              return true;
          })
          .test('total percentage', 'the total percentage is not 100', function(value){
            console.log(value);
            if(this.parent.splitType === SplitType.Percentage){
                return value.reduce((a,b)=>a+b, 0) === 100;
            }
            return true;
        })
          .of(
            Yup.number()
              .required("fill in split")
              .when(["splitType", "total"], (splitType, total, schema) => {
                console.log(splitType, total);
                if (splitType === SplitType.Percentage) {
                  return schema.min(0).max(100);
                } else {
                  return schema.min(0);
                }
              })
              .test("is percentage", "The value must be in [0,100]", function (
                value
              ) {
                console.log(this.options.context);
                return this.options.from[0].value.splitType ===
                  SplitType.Percentage
                  ? value <= 100 && value >= 0
                  : true;
              })
              .test(
                "total percentage",
                "the sum of split is not 100",
                function (value) {
                  console.log(this.options.context);
                  return this.options.from[0].value.splitType ===
                    SplitType.Percentage
                    ? value <= 100 &&
                        value >= 0 
                        // &&
                        // this.parent.reduce((a, b) => a + b, 0) === 100
                    : true;
                }
              )
              .test("is total", "The value must be >0", function (value) {
                console.log(this.options.context);
                return this.options.from[0].value.splitType === SplitType.Value
                  ? value >= 0
                  : true;
              })
          ),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
      render={({ values, errors, touched }) => (
        <Form>
          <Field name="total" type="text" placeholder="total" />
          <br />
          <Field as="select" name="splitType">
            <option value={SplitType.Percentage}>{SplitType.Percentage}</option>
            <option value={SplitType.Value}>{SplitType.Value}</option>
          </Field>
          <div>Splits:</div>
          {errors.splits &&
            touched.splits &&
            typeof errors.splits === "string" && <div>{errors.splits}</div>}
          <FieldArray
            name="splits"
            render={(arrayHelpers) => (
              <div>
                {values.splits && values.splits.length > 0 ? (
                  values.splits.map((friend, index) => (
                    <div key={index}>
                      <Field name={`splits.${index}`} />
                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => arrayHelpers.insert(index, "")}
                      >
                        +
                      </button>
                      <br />
                      {errors.splits && typeof(errors.splits) === 'object' && <ErrorMessage name={`splits.${index}`} />}
                      <br />
                    </div>
                  ))
                ) : (
                  <button type="button" onClick={() => arrayHelpers.push("")}>
                    Add a split
                  </button>
                )}
                <pre>{JSON.stringify(errors, null, 2)}</pre>
                <div>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          />
        </Form>
      )}
    />
  );
};

export default ParentRef;
