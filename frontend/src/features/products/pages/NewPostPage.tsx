import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronRight, Info, PackagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../../auth/hooks/use-auth";
import { WizardActions } from "../components/WizardActions";
import { CategoryField } from "../components/CategoryField";
import { productPostSchema, type ProductPostInput } from "../schemas/product.schemas";
import { productsService } from "../services/products.service";
import "../styles/post-wizard.css";

const steps: { title: string; fields: (keyof ProductPostInput)[] }[] = [
  { title: "Basics", fields: ["productName", "category", "city", "description"] },
  { title: "Deal details", fields: ["storeName", "price", "quantityNeeded", "expiresAt"] },
  { title: "Media", fields: ["productUrl", "imageUrl"] },
  { title: "Review + publish", fields: [] },
];

export function NewPostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    trigger,
    getFieldState,
    setFocus,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductPostInput>({
    resolver: zodResolver(productPostSchema),
    defaultValues: { city: user?.city ?? "", quantityNeeded: 2, category: "" },
    shouldUnregister: false,
  });
  const values = useWatch({ control });
  const busy = checking || isSubmitting;
  const move = (next: number) => {
    setStep(next);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  };
  const validate = async (fields?: (keyof ProductPostInput)[]) => {
    setChecking(true);
    try {
      const valid = await trigger(fields);
      if (!valid) {
        const invalidStep = steps.findIndex((item) =>
          item.fields.some(
            (field) => (!fields || fields.includes(field)) && getFieldState(field).invalid,
          ),
        );
        const field = steps[invalidStep]?.fields.find((name) => getFieldState(name).invalid);
        if (invalidStep >= 0) setStep(invalidStep);
        setError("Check the highlighted fields before continuing.");
        if (field) requestAnimationFrame(() => setFocus(field));
      }
      return valid;
    } finally {
      setChecking(false);
    }
  };
  const review = async () => {
    if (await validate()) move(3);
  };
  const next = async () => {
    if (step === 2) await review();
    else if (await validate(steps[step].fields)) move(step + 1);
  };
  const save = async (input: ProductPostInput) => {
    try {
      setError("");
      await productsService.createPost(input);
      navigate("/activity", { state: { posted: true } });
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <section className="post-wizard container-page">
      <nav className="post-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={13} />
        <Link to="/activity">My activity</Link>
        <ChevronRight size={13} />
        <span>Post a product</span>
      </nav>
      <header className="post-wizard-header">
        <div className="post-title-icon">
          <PackagePlus size={25} />
        </div>
        <div>
          <h1>Post a product</h1>
          <p>Create a product post and find people to buy together.</p>
        </div>
      </header>
      <nav className="post-steps" aria-label="Product creation steps">
        {steps.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-current={step === index ? "step" : undefined}
            disabled={busy}
            onClick={() => (index === 3 ? void review() : move(index))}
          >
            <span className="post-step-number">{index + 1}</span>
            {item.title}
          </button>
        ))}
      </nav>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          if (step !== 3) {
            void next();
            return;
          }
          void handleSubmit(save, () => {
            void validate();
          })(event);
        }}
      >
        <div className="post-wizard-content">
          <div className="post-section-heading">
            <h2 ref={heading} tabIndex={-1}>
              {steps[step].title}
            </h2>
            <span>
              Step {step + 1} of {steps.length}
            </span>
          </div>
          {error && (
            <p className="post-message post-message-error" role="alert">
              {error}
            </p>
          )}
          <div hidden={step !== 0}>
            <p className="post-intro">
              Start with the product you want to share. These details help others find your post.
            </p>
            <div className="post-info">
              <Info size={18} />
              <span>
                You can check all your details before publishing. All fields are required.
              </span>
            </div>
            <fieldset className="post-fieldset" disabled={busy}>
              <legend>Product details</legend>
              <FormField
                label="Product name"
                placeholder="e.g. Sony WH-1000XM5 headphones"
                maxLength={200}
                error={errors.productName?.message}
                {...register("productName")}
              />
              <CategoryField registration={register("category")} error={errors.category?.message} />
              <FormField
                label="City"
                placeholder="e.g. Casablanca"
                maxLength={100}
                error={errors.city?.message}
                {...register("city")}
              />
              <label className="auth-field-wrap">
                <span className="label">Description</span>
                <textarea
                  className="field auth-field"
                  rows={5}
                  maxLength={2000}
                  placeholder="Describe the product, its condition, and what makes this a good deal."
                  {...register("description")}
                />
                {errors.description && (
                  <span className="auth-field-error">{errors.description.message}</span>
                )}
              </label>
            </fieldset>
          </div>
          <div hidden={step !== 1}>
            <p className="post-intro">Set the price and the quantity needed to get the deal.</p>
            <fieldset className="post-fieldset" disabled={busy}>
              <legend>Purchase details</legend>
              <FormField
                label="Store name"
                placeholder="Where is the product sold?"
                maxLength={120}
                error={errors.storeName?.message}
                {...register("storeName")}
              />
              <FormField
                label="Price per item (MAD)"
                type="number"
                min={0}
                step="0.01"
                max={100000000}
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
              />
              <FormField
                label="Total quantity needed"
                type="number"
                min={1}
                max={10000}
                error={errors.quantityNeeded?.message}
                {...register("quantityNeeded", { valueAsNumber: true })}
              />
              <FormField
                label="Deal expiry date and time"
                type="datetime-local"
                error={errors.expiresAt?.message}
                {...register("expiresAt")}
              />
            </fieldset>
            <p className="post-footnote">
              The expiry time uses your local time zone. Expired posts stop appearing in search
              results.
            </p>
          </div>
          <div hidden={step !== 2}>
            <p className="post-intro">
              Add links so people can see the product and visit the original offer.
            </p>
            <fieldset className="post-fieldset" disabled={busy}>
              <legend>Product links</legend>
              <FormField
                label="Product link"
                type="url"
                placeholder="https://store.example/product"
                maxLength={2000}
                error={errors.productUrl?.message}
                {...register("productUrl")}
              />
              <FormField
                label="Image link"
                type="url"
                placeholder="https://store.example/product.jpg"
                maxLength={2000}
                error={errors.imageUrl?.message}
                {...register("imageUrl")}
              />
            </fieldset>
            <p className="post-footnote">
              Use a direct link to a product image. Both links must start with https:// or http://.
            </p>
          </div>
          {step === 3 && (
            <div className="post-review">
              <div className="post-message post-message-success">
                <CheckCircle2 size={19} />
                <span>Details checked. Review your post, then publish it.</span>
              </div>
              <p className="post-intro">
                Your post will be visible to other shoppers. Your email and address stay private.
              </p>
              {steps.slice(0, 3).map((item, index) => (
                <section className="post-review-section" key={item.title}>
                  <div>
                    <h3>{item.title}</h3>
                    <button type="button" disabled={busy} onClick={() => move(index)}>
                      Edit
                    </button>
                  </div>
                  <dl>
                    {item.fields.map((field) => (
                      <div key={field}>
                        <dt>
                          {
                            (
                              {
                                productName: "Product name",
                                category: "Category",
                                city: "City",
                                description: "Description",
                                storeName: "Store",
                                price: "Price per item",
                                quantityNeeded: "Total quantity needed",
                                expiresAt: "Expires",
                                productUrl: "Product link",
                                imageUrl: "Image link",
                              } as Record<keyof ProductPostInput, string>
                            )[field]
                          }
                        </dt>
                        <dd>
                          {field === "price"
                            ? `${Number(values.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
                            : field === "expiresAt"
                              ? new Date(values.expiresAt ?? "").toLocaleString()
                              : String(values[field] ?? "")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          )}
        </div>
        <WizardActions
          steps={steps.map((item) => item.title)}
          step={step}
          busy={busy}
          submitting={isSubmitting}
          submitLabel="Publish product"
          submittingLabel="Publishing…"
          onPrevious={() => move(step - 1)}
          onNext={() => void next()}
          onReview={() => void review()}
        />
      </form>
    </section>
  );
}
