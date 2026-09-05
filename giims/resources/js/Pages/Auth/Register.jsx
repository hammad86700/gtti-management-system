import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        father_name: '',
        cnic: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Candidate Online Registration" />

            <div className="mb-4 text-center">
                <h3 className="text-lg font-black text-slate-900">Student Account Registration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter authentic credentials as per your CNIC / Matric certificate</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Candidate Full Name (as per CNIC / Matric) *" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-xs"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="e.g. Muhammad Ali"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="father_name" value="Father's Name *" />

                        <TextInput
                            id="father_name"
                            name="father_name"
                            value={data.father_name}
                            className="mt-1 block w-full text-xs"
                            placeholder="e.g. Tariq Mehmood"
                            onChange={(e) => setData('father_name', e.target.value)}
                            required
                        />

                        <InputError message={errors.father_name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="cnic" value="CNIC / B-Form Number *" />

                        <TextInput
                            id="cnic"
                            name="cnic"
                            value={data.cnic}
                            className="mt-1 block w-full font-mono text-xs"
                            placeholder="31202-1234567-1"
                            maxLength="15"
                            onChange={(e) => setData('cnic', e.target.value)}
                            required
                        />

                        <InputError message={errors.cnic} className="mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="phone" value="Mobile / WhatsApp Number *" />

                        <TextInput
                            id="phone"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full font-mono text-xs"
                            placeholder="0300-1234567"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />

                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address *" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full text-xs"
                            autoComplete="username"
                            placeholder="student@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />

                        <InputError message={errors.email} className="mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="password" value="Password *" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full text-xs"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password *" />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full text-xs"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />

                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Link
                        href={route('login')}
                        className="rounded-md text-xs text-slate-500 underline hover:text-govt-green"
                    >
                        Already registered? Log in
                    </Link>

                    <PrimaryButton className="ms-4 text-xs font-black uppercase tracking-wider" disabled={processing}>
                        {processing ? 'Registering...' : 'Register Account'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
